import styles from "./Product.module.css";
import PageNav from "../components/PageNav";

export default function Product() {
  return (
    <main className={styles.product}>
      <PageNav />
      <section>
        <img
          src="img-1.jpg"
          alt="person with dog overlooking mountain with sunset"
        />
        <div>
          <h2>About WanderMap</h2>
          <p>
            WanderMap is your personal travel companion that tracks your
            footsteps across the globe, helping you document every city you
            explore. From bustling metropolises to quiet hidden gems, WanderMap
            lets you map your journey, so you never forget the incredible
            experiences you&apos;ve had along the way.
          </p>
          <p>
            Through WanderMap, you can share your travels with friends and show
            them the unique path you&apos;ve taken across the globe. It&apos;s
            the perfect way to celebrate your experiences and inspire others to
            wander. With WanderMap, your footsteps become a lasting story—one
            step, one city at a time.
          </p>
        </div>
      </section>
    </main>
  );
}
