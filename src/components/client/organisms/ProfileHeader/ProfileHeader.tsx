import React from "react";
import { ProfileHeaderProps } from "./types";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { Image } from "../../atoms/Image";
import { CardSwitch } from "../../molecules/CardSwitch";
import styles from "./ProfileHeader.module.scss";

export const ProfileHeader = ({
    bannerSrc,
    avatarSrc,
    initials,
    name,
    role,
    switchOptions,
    switchValue,
    onSwitchChange
}: ProfileHeaderProps) => {
    return (
        <header className={styles.headerContainer}>
            {/* Imagen de Portada (Banner) */}
            <div className={styles.bannerWrapper}>
                <Image 
                    src={bannerSrc} 
                    alt="Profile Banner" 
                    width={1200} 
                    height={300} 
                    className={styles.bannerImage}
                />
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.profileInfo}>
                    {/* El Avatar usa 'lg' y 'ringed' para resaltar */}
                    <Avatar 
                        src={avatarSrc} 
                        initials={initials} 
                        size="lg" 
                        ringed 
                        className={styles.avatarOverlap} 
                    />
                    
                    <div className={styles.textGroup}>
                        <Text variant="body" className={styles.userName}>
                            {name}
                        </Text>
                        <Text variant="caption" className={styles.userRole}>
                            {role}
                        </Text>
                    </div>
                </div>

                {/* Switch de navegación entre vistas */}
                <div className={styles.actions}>
                    <CardSwitch 
                        options={switchOptions} 
                        value={switchValue} 
                        onChange={onSwitchChange} 
                    />
                </div>
            </div>
        </header>
    );
};

export default ProfileHeader;