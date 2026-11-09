#!/usr/bin/env python3
"""Reconstruye un servicio existente conservando sus Compose, montajes y redes.
Ejecutar desde su carpeta desplegada. No ejecuta down ni elimina volumenes.
No imprime la configuracion/env de Compose. Python >=3.6; Docker Compose v2.
"""
import json
import os
import re
import subprocess
import sys
import time


def ejecutar(args, capturar=True):
    r = subprocess.run(args, stdout=subprocess.PIPE if capturar else None,
                       stderr=subprocess.PIPE if capturar else None, universal_newlines=True)
    if r.returncode:
        raise RuntimeError('Fallo de Docker/Compose; revisar el servicio. No se imprimen variables de configuracion.')
    return r.stdout.strip() if capturar else ''


def inspeccionar(contenedor, campo):
    return json.loads(ejecutar(['docker', 'inspect', contenedor, '--format', '{{json ' + campo + '}}']))


def huella_montajes(montajes):
    resultado = set()
    for m in montajes:
        if m['Type'] not in ('bind', 'volume'):
            raise RuntimeError('Montaje no soportado; no se recrea automaticamente.')
        resultado.add((m['Destination'], m['Type'], m.get('Name') if m['Type'] == 'volume' else os.path.realpath(m['Source']), not m['RW']))
    return resultado


def validar_montajes(config, servicio, actuales):
    previstos = set()
    for v in config['services'][servicio].get('volumes', []):
        if v['type'] == 'bind':
            origen = os.path.realpath(v['source'])
        elif v['type'] == 'volume':
            origen = config['volumes'][v['source']]['name']
        else:
            raise RuntimeError('Montaje no soportado; no se recrea automaticamente.')
        previstos.add((v['target'], v['type'], origen, bool(v.get('read_only'))))
    if previstos != huella_montajes(actuales):
        raise RuntimeError('Los montajes previstos difieren de los actuales. Corregir las rutas/variables de Compose antes de recrear; se conserva el contenedor actual.')


def restaurar_redes(contenedor, originales, actuales):
    for nombre, datos in originales.items():
        aliases = {a for a in datos.get('Aliases') or [] if a and not re.fullmatch(r'[0-9a-f]{12,64}', a)}
        if nombre in actuales and aliases.issubset(set(actuales[nombre].get('Aliases') or [])):
            continue
        if nombre in actuales:
            aliases.update(a for a in actuales[nombre].get('Aliases') or [] if a and not re.fullmatch(r'[0-9a-f]{12,64}', a))
            ejecutar(['docker', 'network', 'disconnect', nombre, contenedor])
        args = ['docker', 'network', 'connect']
        for alias in sorted(aliases):
            args += ['--alias', alias]
        ejecutar(args + [nombre, contenedor])


def main(argv):
    if len(argv) not in (1, 2) or (len(argv) == 2 and argv[1] != '--comprobar'):
        raise RuntimeError('Uso: actualizar-servicio-preservando.py CONTENEDOR [--comprobar]')
    contenedor = argv[0]
    labels = inspeccionar(contenedor, '.Config.Labels')
    directorio = labels.get('com.docker.compose.project.working_dir', '')
    servicio = labels.get('com.docker.compose.service', '')
    proyecto = labels.get('com.docker.compose.project', '')
    archivos = labels.get('com.docker.compose.project.config_files', '').split(',')
    if not directorio or os.path.realpath(directorio) != os.path.realpath(os.getcwd()) or not servicio or not proyecto or any(not os.path.isfile(a) for a in archivos):
        raise RuntimeError('El directorio/servicio o alguno de sus Compose no corresponde al despliegue; no se recrea.')
    compose = ['docker', 'compose', '-p', proyecto]
    for archivo in archivos:
        compose += ['-f', archivo]
    montajes = inspeccionar(contenedor, '.Mounts')
    redes = inspeccionar(contenedor, '.NetworkSettings.Networks')
    config = json.loads(ejecutar(compose + ['config', '--format', 'json']))
    validar_montajes(config, servicio, montajes)
    if len(argv) == 2:
        print('CONFIGURACION_Y_MONTAJES_OK; no se modifico el servicio')
        return
    ejecutar(compose + ['build', servicio], capturar=False)
    ejecutar(compose + ['up', '-d', '--no-build', '--no-deps', '--pull', 'never', '--force-recreate', servicio], capturar=False)
    nuevo = ejecutar(compose + ['ps', '-a', '-q', servicio])
    if not nuevo or '\n' in nuevo:
        raise RuntimeError('No se obtuvo un unico contenedor actualizado.')
    if huella_montajes(inspeccionar(nuevo, '.Mounts')) != huella_montajes(montajes):
        raise RuntimeError('Los montajes reales cambiaron; revisar antes de utilizar el servicio.')
    restaurar_redes(nuevo, redes, inspeccionar(nuevo, '.NetworkSettings.Networks'))
    if set(inspeccionar(nuevo, '.NetworkSettings.Networks')) != set(redes):
        raise RuntimeError('Las redes cambiaron; revisar el despliegue.')
    for _ in range(60):
        estado = inspeccionar(nuevo, '.State')
        salud = (estado.get('Health') or {}).get('Status')
        if estado.get('Running') and (salud == 'healthy' or salud is None):
            print('SERVICIO_ACTUALIZADO; montajes y redes conservados')
            return
        if not estado.get('Running') or salud == 'unhealthy':
            break
        time.sleep(1)
    raise RuntimeError('No se confirmo salud del servicio; revisar logs.')


if __name__ == '__main__':
    try:
        main(sys.argv[1:])
    except (RuntimeError, KeyError, ValueError, OSError) as e:
        print(str(e) if isinstance(e, RuntimeError) else 'No se pudo comprobar el despliegue; revisar Docker/Compose.', file=sys.stderr)
        sys.exit(1)
