import importlib.util
import contextlib
import io
import json
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('actualizador', str(Path(__file__).resolve().parents[2] / 'scripts/actualizar-servicio-preservando.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class Preservacion(unittest.TestCase):
    def test_montajes_bind_y_volumen_conservan_origen_y_solo_lectura(self):
        config = {'services': {'api': {'volumes': [{'type': 'bind', 'source': '/srv/certs', 'target': '/app/certs', 'read_only': True}, {'type': 'volume', 'source': 'datos', 'target': '/app/uploads'}]}}, 'volumes': {'datos': {'name': 'api_datos'}}}
        actuales = [{'Type': 'bind', 'Source': '/srv/certs', 'Destination': '/app/certs', 'RW': False}, {'Type': 'volume', 'Name': 'api_datos', 'Destination': '/app/uploads', 'RW': True}]
        m.validar_montajes(config, 'api', actuales)
        config['services']['api']['volumes'][0]['source'] = '/srv/carpeta-equivocada'
        with self.assertRaises(RuntimeError):
            m.validar_montajes(config, 'api', actuales)

    def test_detecta_cambio_de_lectura(self):
        config = {'services': {'api': {'volumes': [{'type': 'bind', 'source': '/srv/certs', 'target': '/app/certs'}]}}}
        with self.assertRaises(RuntimeError):
            m.validar_montajes(config, 'api', [{'Type': 'bind', 'Source': '/srv/certs', 'Destination': '/app/certs', 'RW': False}])

    def test_restaura_red_manual_y_alias_sin_desconectar_otros(self):
        with patch.object(m, 'ejecutar') as run:
            m.restaurar_redes('nuevo', {'default': {}, 'vivi-qa-cierre': {'Aliases': ['api-tickets-vivi-qa', 'a' * 64]}}, {'default': {}})
            run.assert_called_once_with(['docker', 'network', 'connect', '--alias', 'api-tickets-vivi-qa', 'vivi-qa-cierre', 'nuevo'])

    def test_preflight_fallido_no_reconstruye_ni_recrea(self):
        labels = {'com.docker.compose.project.working_dir': '/srv/app', 'com.docker.compose.service': 'api', 'com.docker.compose.project': 'p', 'com.docker.compose.project.config_files': '/srv/app/base.yml,/srv/app/overlay.yml'}
        with patch.object(m.os, 'getcwd', return_value='/srv/app'), patch.object(m.os.path, 'isfile', return_value=True), patch.object(m, 'inspeccionar', side_effect=[labels, [], {}]), patch.object(m, 'ejecutar', return_value='{"services":{"api":{"volumes":[]}}}') as run, patch.object(m, 'validar_montajes', side_effect=RuntimeError('cambio')):
            with self.assertRaises(RuntimeError):
                m.main(['contenedor'])
            self.assertEqual(run.call_count, 1)
            self.assertEqual(run.call_args[0][0][-3:], ['config', '--format', 'json'])

    def test_comprobar_front_independiente_solo_lee_sus_compose_y_no_imprime_entorno(self):
        labels = {'com.docker.compose.project.working_dir': '/srv/panel', 'com.docker.compose.service': 'sistema-tickets-web', 'com.docker.compose.project': 'panel', 'com.docker.compose.project.config_files': '/srv/panel/docker-compose.yml,/srv/panel/docker-compose.qa.yml'}
        config = {'services': {'sistema-tickets-web': {'volumes': [], 'environment': {'CLAVE_PRUEBA': 'valor-que-no-debe-imprimir'}}}}
        salida = io.StringIO()
        with patch.object(m.os, 'getcwd', return_value='/srv/panel'), patch.object(m.os.path, 'isfile', return_value=True), patch.object(m, 'inspeccionar', side_effect=[labels, [], {}]), patch.object(m, 'ejecutar', return_value=json.dumps(config)) as run, contextlib.redirect_stdout(salida):
            m.main(['sistema-tickets-web', '--comprobar'])
        run.assert_called_once_with(['docker', 'compose', '-p', 'panel', '-f', '/srv/panel/docker-compose.yml', '-f', '/srv/panel/docker-compose.qa.yml', 'config', '--format', 'json'])
        self.assertIn('CONFIGURACION_Y_MONTAJES_OK', salida.getvalue())
        self.assertNotIn('valor-que-no-debe-imprimir', salida.getvalue())

    def test_actualiza_solo_el_front_y_restaura_su_red_adicional(self):
        labels = {'com.docker.compose.project.working_dir': '/srv/panel', 'com.docker.compose.service': 'sistema-tickets-web', 'com.docker.compose.project': 'panel', 'com.docker.compose.project.config_files': '/srv/panel/base.yml,/srv/panel/overlay.yml'}
        redes = {'panel_default': {}, 'red-proxy': {'Aliases': ['emetra-panel']}}
        def ejecutar(args, capturar=True):
            if 'config' in args:
                return json.dumps({'services': {'sistema-tickets-web': {'volumes': []}}})
            if 'ps' in args:
                return 'contenedor-nuevo'
            return ''
        salida = io.StringIO()
        with patch.object(m.os, 'getcwd', return_value='/srv/panel'), patch.object(m.os.path, 'isfile', return_value=True), patch.object(m, 'inspeccionar', side_effect=[labels, [], redes, [], {'panel_default': {}}, redes, {'Running': True}]), patch.object(m, 'ejecutar', side_effect=ejecutar) as run, contextlib.redirect_stdout(salida):
            m.main(['sistema-tickets-web'])
        compose = ['docker', 'compose', '-p', 'panel', '-f', '/srv/panel/base.yml', '-f', '/srv/panel/overlay.yml']
        run.assert_any_call(compose + ['build', 'sistema-tickets-web'], capturar=False)
        run.assert_any_call(compose + ['up', '-d', '--no-build', '--no-deps', '--pull', 'never', '--force-recreate', 'sistema-tickets-web'], capturar=False)
        run.assert_any_call(['docker', 'network', 'connect', '--alias', 'emetra-panel', 'red-proxy', 'contenedor-nuevo'])
        self.assertIn('SERVICIO_ACTUALIZADO', salida.getvalue())
        for llamada in run.call_args_list:
            self.assertNotIn('down', llamada[0][0])
            self.assertNotIn('api-vivi_v2', ' '.join(llamada[0][0]))
