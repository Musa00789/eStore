import styles from "./Error.module.css";
import { useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.main}>
      <h1 className={styles.mainHeading}>Oops !</h1>
      <h3 className={styles.subHeading}>Something went wrong.</h3>
      <h6 className={styles.info}>
        Check your internet connection and try again.
      </h6>
      <button
        onClick={() => {
          navigate(-1);
        }}
        className={styles.reloadBtn}
      >
        Reload!
      </button>
    </div>
  );
};

export default Error;
