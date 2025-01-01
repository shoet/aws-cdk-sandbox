import styles from "./index.module.scss";

export const Header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.appTitle}>AppTitle</div>
      <div className={styles.userProfile}>
        <div className={styles.userName}>Hello, User!</div>
      </div>
    </div>
  );
};
