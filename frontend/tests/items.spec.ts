import { expect, test } from "@playwright/test";
import { firstSuperuser, firstSuperuserPassword } from "./config.ts";
import { logInUser } from "./utils/user";

// Most tests will be authenticated by default via the playwright config
// We only need to explicitly log in for tests where we want to test navigation from login

test.describe("Items page", () => {
    test.use({ storageState: { cookies: [], origins: [] } })

    test("Items page is accessible from navigation", async ({ page }) => {
        // Login explicitly to test navigation
        await logInUser(page, firstSuperuser, firstSuperuserPassword);

        // Navigate to items page using the sidebar menu
        await page.getByRole("button", { name: "Items" }).click();
        await page.waitForURL("/items");

        // Verify page title
        await expect(page.locator("h1").filter({ hasText: "Items Management" })).toBeVisible();
    });
})

test("Items page displays DataTable and proper columns", async ({ page }) => {
    await page.goto("/items");

    // Check for data table presence
    await expect(page.locator("div.p-datatable")).toBeVisible();

    // Verify column headers are visible
    await expect(page.getByRole("columnheader", { name: "ID" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Title" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Description" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Actions" })).toBeVisible();
});

test("NavBar is displayed with search input", async ({ page }) => {
    await page.goto("/items");

    // Verify NavBar elements
    await expect(page.getByRole("button", { name: "Add Item" })).toBeVisible();
    await expect(page.getByLabel('Search')).toBeVisible();
});

test("Empty state is shown when no items exist", async ({ page }) => {
    // This test assumes there might be scenarios with no items
    // We'd need a way to ensure no items exist in the database for this test to be accurate
    await page.goto("/items");

    // If there are no items, the empty template should be visible
    // This might not be consistently testable without data setup/teardown
    const hasItems = await page.locator("div.p-datatable-tbody tr").count() > 0;

    if (!hasItems) {
        await expect(page.getByText("No item found.")).toBeVisible();
    }
});

test("Add Item button opens modal", async ({ page }) => {
    await page.goto("/items");

    // Click add item button
    await page.getByRole("button", { name: "Add Item" }).click();

    // Verify modal is open
    const dialog = await page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Look for Add Item text specifically within the dialog
    await expect(dialog.getByText("Add Item")).toBeVisible();

    // Verify form fields are present
    await expect(page.getByPlaceholder('Title')).toBeVisible();
    await expect(page.getByPlaceholder('Title')).toBeVisible();

    // Verify cancel works
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Actions menu provides edit and delete options", async ({ page }) => {
    await page.goto("/items");

    // This test needs existing data to work properly
    const hasItems = await page.locator("div.p-datatable-tbody tr").count() > 0;

    if (hasItems) {
        // Click the actions menu of the first item
        await page.locator("button.p-button").first().click();

        // Verify menu options
        await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
        await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();

        // Click outside to close menu
        await page.click("h1");
    }
});

test("Pagination controls are visible", async ({ page }) => {
    await page.goto("/items");

    // Verify pagination controls
    await expect(page.locator(".p-paginator")).toBeVisible();
}); 