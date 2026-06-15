import React from "react";
import classNames from "classnames";
import { UserCard } from "../../molecules/UserCard";
import { UsersGridProps } from "./types";
import styles from "./UsersGrid.module.scss"

export const UsersGrid: React.FC<UsersGridProps> = ({
    users,
    className,
    pathActive = "profile",
}) => {
    return (
        <section className={classNames(styles.UsersGrid, className)}>
            <div className={styles.grid}>
                {users.map((user, index) => (
                    <UserCard
                        id={user.id || index.toString()}
                        key={index}
                        {...user}
                        className={styles.card}
                        pathActive={pathActive}
                    />
                ))}
            </div>
        </section>
    );
};

export default UsersGrid;
