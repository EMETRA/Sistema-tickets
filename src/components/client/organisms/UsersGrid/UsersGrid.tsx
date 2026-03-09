import React from "react";
import classNames from "classnames";
import { UserCard } from "../../molecules/UserCard";
import { UsersGridProps } from "./types";
import styles from "./UsersGrid.module.scss"

export const UsersGrid: React.FC<UsersGridProps> = ({
    users,
    className,
}) => {
    return (
        <section className={classNames(styles.UsersGrid, className)}>
            <div className={styles.grid}>
                {users.map((user, index) => (
                <UserCard
                    key={user.email || index}
                    {...user}
                    className={styles.card}
                />
                ))}
            </div>
        </section>
    );
};

export default UsersGrid;
