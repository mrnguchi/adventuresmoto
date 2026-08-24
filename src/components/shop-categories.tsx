import { CategoryCard } from "@/components/category-card";
import { shopCategories } from "@/data/shop-categories";

export function ShopCategories() {
  return (
    <section className="shop-categories" aria-labelledby="shop-categories-title">
      <div className="site-container">
        <h2 className="sr-only" id="shop-categories-title">
          Shop by category
        </h2>

        <div className="category-grid">
          {shopCategories.map((category) => (
            <CategoryCard key={category.title} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
