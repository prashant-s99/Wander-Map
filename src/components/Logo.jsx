import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

function Logo() {
  return (
    <Link to="/">
      <span>
        <img src="/logo.png" alt="WanderMap Logo" className={styles.logo} />
      </span>
    </Link>
  );
}

export default Logo;
