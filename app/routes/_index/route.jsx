import { Link } from "@remix-run/react";
import styles from "./styles.module.css";

export default function Home() {
  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <div className={styles.badge}>PORTFOLIO PROJECT</div>
        <h1 className={styles.heading}>Flair Product Customiser</h1>
        <p className={styles.text}>
          Design a made-to-order product directly in your browser. Add text and
          images, adjust layers, and preview your custom design.
        </p>
        <Link className={styles.button} to="/customiser">
          Open the live demo
        </Link>
        <ul className={styles.list}>
          <li>
            <strong>Canvas editing</strong>. Add, move, resize and style text
            and image elements.
          </li>
          <li>
            <strong>Layer controls</strong>. Reorder, toggle and manage each
            part of the design.
          </li>
          <li>
            <strong>Browser demo</strong>. Uses local sample data and does not
            require a Shopify login.
          </li>
        </ul>
      </div>
    </div>
  );
}
