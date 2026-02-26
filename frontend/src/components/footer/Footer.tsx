import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.appFooter}>
      © {new Date().getFullYear()} DWH - DJP
    </footer>
  );
}

