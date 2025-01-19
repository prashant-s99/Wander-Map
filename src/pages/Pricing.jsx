// Uses the same styles as Product
import styles from "./Product.module.css";
import PageNav from "../components/PageNav";

export default function Product() {
  return (
    <main className={styles.product}>
      <PageNav />
      <section>
        <div>
          <h2>
            Simple pricing.
            <br />
            Just $5/month.
          </h2>
          <p>
            WanderMap offers a variety of plans to suit your travel needs. Start
            with our free version to begin tracking your journeys and taking
            notes on the places you visit.
          </p>
          <p>
            For those looking to unlock even more features—such as unlimited
            cities, and premium customization options—our premium plan is
            available at an affordable price. No matter your travel style,
            WanderMap is here to help you preserve your memories and share your
            adventures with the world.
          </p>
        </div>
        <img src="img-2.jpg" alt="overview of a large city with skyscrapers" />
      </section>
    </main>
  );
}
