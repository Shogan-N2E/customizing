import { Button } from "@shopify/polaris";
import { useState } from "react";

export default function ProductSelector() {
  const [product, setProduct] = useState(null);

  const selectProduct = async () => {
    if (!window.shopify) {
      console.error("Shopify App Bridge is not available.");
      return;
    }

    const selected = await window.shopify.resourcePicker({
      type: "product",
      action: "select",
    });

    if (selected && selected.length > 0) {
      const { id, title, variants, images, handle } = selected[0];
      setProduct({
        id,
        title,
        handle,
        variantId: variants?.[0]?.id,
        image: images?.[0]?.originalSrc,
      });
    }
  };

  return (
    <div>
      <Button onClick={selectProduct}>
        {product ? `Selected: ${product.title}` : "Select a Product"}
      </Button>

      {product && (
        <div>
          <img
            src={product.image}
            alt={product.title}
            style={{ maxWidth: "100px" }}
          />
          <p>{product.title}</p>
          <p>Variant ID: {product.variantId}</p>
        </div>
      )}
    </div>
  );
}

