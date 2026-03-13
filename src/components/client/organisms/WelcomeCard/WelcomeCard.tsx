import { WelcomeCardProps } from "./types";
import { WelcomeMessage } from "../../molecules/WelcomeMessage";
import styles from "./WelcomeCard.module.scss";
import classNames from "classnames";
import { Image } from "../../atoms/Image";

export const WelcomeCard = ({ userName, imageSrc, className }: WelcomeCardProps) => {
    return (
        <article className={classNames(styles.welcomeCard, className)}>
            <div className={styles.textContainer}>
                <WelcomeMessage userName={userName} />
            </div>
            <div className={styles.illustrationWrapper}>
                <Image
                    src={imageSrc} 
                    alt="Ilustración de bienvenida" 
                    width={220} 
                    height={100}
                    className={styles.illustration}
                />
            </div>
        </article>
    );
};

export default WelcomeCard;