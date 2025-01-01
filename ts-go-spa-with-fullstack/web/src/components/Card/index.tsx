import styles from "./index.module.scss";
import { PropsWithChildren } from "react";

export const Card = (props: PropsWithChildren<{}>) => {
  const { children } = props;

  return <div className={styles.card}>{children}</div>;
};
