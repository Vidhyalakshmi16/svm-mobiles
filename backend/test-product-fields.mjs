/**
 * Quick test: update description, colors, specifications via multipart PUT
 * Run: node test-product-fields.mjs [productId]
 */
const productId = process.argv[2] || "690639f222640fbb8ea20cd0";
const baseUrl = "http://localhost:5000/api";

const testDescription = `Test description ${Date.now()}`;
const testColors = ["Black", "Silver", "Blue"];
const testSpecs = {
  RAM: "8GB",
  Storage: "256GB",
  Display: "6.7 inch AMOLED",
};

async function getProduct(id) {
  const res = await fetch(`${baseUrl}/products/${id}`);
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  return res.json();
}

async function updateProduct(id) {
  const form = new FormData();
  form.append("description", testDescription);
  form.append("colors", JSON.stringify(testColors));
  form.append("specifications", JSON.stringify(testSpecs));
  form.append("existingImages", JSON.stringify([]));

  const res = await fetch(`${baseUrl}/products/${id}`, {
    method: "PUT",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`PUT failed: ${res.status} ${JSON.stringify(data)}`);
  return data.product || data;
}

async function main() {
  console.log("--- BEFORE ---");
  const before = await getProduct(productId);
  console.log({
    description: before.description,
    colors: before.colors,
    specifications: before.specifications,
  });

  console.log("\n--- UPDATING ---");
  await updateProduct(productId);

  console.log("\n--- AFTER ---");
  const after = await getProduct(productId);
  console.log({
    description: after.description,
    colors: after.colors,
    specifications: after.specifications,
  });

  const specs = after.specifications || {};
  const ok =
    after.description === testDescription &&
    JSON.stringify(after.colors) === JSON.stringify(testColors) &&
    specs.RAM === testSpecs.RAM &&
    specs.Storage === testSpecs.Storage;

  console.log(ok ? "\n✅ TEST PASSED" : "\n❌ TEST FAILED");
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
