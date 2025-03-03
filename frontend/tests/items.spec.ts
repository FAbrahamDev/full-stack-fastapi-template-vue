import { expect, test } from "@playwright/test";
import { firstSuperuser, firstSuperuserPassword } from "./config.ts";
import { logInUser } from "./utils/user";
import { Page } from "@playwright/test";

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

    // Wait for data load
    await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
    await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

    // Check if the empty message is visible
    const isEmptyMessageVisible = await page.locator(".p-datatable-empty-message").isVisible();

    // If empty message is not visible, there are actual data items
    const hasItems = !isEmptyMessageVisible;

    console.log("hasItems:", hasItems);

    if (hasItems) {
        // Keep deleting until the empty message appears
        while (!await page.locator(".p-datatable-empty-message").isVisible()) {
            // Always target the first row that's not an empty message row
            await page.locator(".p-datatable-tbody tr:not(.p-datatable-empty-message)").first().locator("button").click();
            await page.getByRole("menuitem", { name: "Delete" }).click();
            await page.getByLabel('Delete', { exact: true }).click();

            // Wait a moment for the UI to update
            await page.waitForTimeout(100);
        }
    }

    // Verify the empty message is visible
    await expect(page.getByText("No item found.")).toBeVisible();
});

test("Add Item button opens modal", async ({ page }) => {
    await page.goto("/items");

    // Wait for data load
    await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
    await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

    // Click add item button
    await page.getByRole("button", { name: "Add Item" }).click();

    // Verify modal is open
    const dialog = await page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Look for Add Item text specifically within the dialog
    await expect(dialog.getByText("Add Item")).toBeVisible();

    // Verify form fields are present
    await expect(page.getByPlaceholder('Title')).toBeVisible();
    await expect(page.getByPlaceholder('Description')).toBeVisible();

    // Verify cancel works
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
});


/**
 * Helper function to delete an item by its title
 */
async function deleteItemByTitle(page: Page, title: string): Promise<boolean> {
    try {
        await page.goto("/items");

        // Wait for data load
        await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
        await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

        // Check if the item exists
        const itemExists = await page.getByText(title).isVisible();

        if (!itemExists) {
            return true; // Item is already gone
        }

        // Find the row containing our test item
        // Using a more compatible approach instead of XPath
        const row = page.locator('tr', { has: page.getByText(title, { exact: true }) });

        // Click actions menu for this item
        await row.getByRole('button').click();

        // Click delete option
        await page.getByRole("menuitem", { name: "Delete" }).click();
        await page.getByLabel('Delete', { exact: true }).click();

        // Verify item is no longer visible
        await expect(page.getByText(title)).not.toBeVisible();

        return true;
    } catch (error) {
        console.error(`Failed to delete item with title: ${title}`, error);
        return false;
    }
}


test("Can successfully add a new item", async ({ page }) => {
    let createdTitle: string | null = null;

    try {
        await page.goto("/items");

        // Wait for data load
        await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
        await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

        // Check if the empty message is visible to determine initial state
        const isInitiallyEmpty = await page.locator(".p-datatable-empty-message").isVisible();

        // Click add item button from NavBar
        await page.getByRole("button", { name: "Add Item" }).click();

        // Wait for modal to appear
        const dialog = await page.getByRole("dialog");
        await expect(dialog).toBeVisible();

        // Fill in form fields
        createdTitle = `Test Item ${Date.now()}`;
        const testDescription = "Description for test item";
        await page.getByPlaceholder("Title").fill(createdTitle);
        await page.getByPlaceholder("Description").fill(testDescription);

        // Submit form
        await page.getByRole("button", { name: "Save" }).click();

        // Wait for modal to close
        await expect(dialog).not.toBeVisible();

        // If the table was initially empty, verify the empty message is no longer shown
        if (isInitiallyEmpty) {
            await expect(page.locator(".p-datatable-empty-message")).not.toBeVisible();
        }

        // Verify new item is visible in the table
        await expect(page.getByText(createdTitle)).toBeVisible();
        await expect(page.getByText(testDescription)).toBeVisible();
    } finally {
        // Cleanup: Delete the created item if it exists
        if (createdTitle) {
            await test.step("Cleanup - Delete created item", async () => {
                await deleteItemByTitle(page, createdTitle!);
            });
        }
    }
});



test.describe("Require an item for each test", () => {
    let createdTitle: string | null = null;

    test.beforeEach(async ({ page }) => {
        // Create a test item before each test
        await test.step("Create item for test", async () => {
            await page.goto("/items");

            // Wait for data load
            await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
            await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

            // Click add item button
            await page.getByRole("button", { name: "Add Item" }).click();

            // Fill in form fields
            createdTitle = `Test Item ${Date.now()}`;
            await page.getByPlaceholder("Title").fill(createdTitle);
            await page.getByPlaceholder("Description").fill("Description for test item");

            // Submit form
            await page.getByRole("button", { name: "Save" }).click();

            // Wait for the dialog to close
            await expect(page.getByRole("dialog")).not.toBeVisible();

            // Wait for the item to appear
            await expect(page.getByText(createdTitle)).toBeVisible();
        });
    });

    test.afterEach(async ({ page }) => {
        // Cleanup: Delete the item we created if any
        if (createdTitle) {
            await test.step("Cleanup - Delete created item", async () => {
                await deleteItemByTitle(page, createdTitle!);
            });
            createdTitle = null;
        }
    });

    test("Actions menu provides edit and delete options", async ({ page }) => {
        await page.goto("/items");

        // Wait for data load
        await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
        await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

        // We should already have an item from beforeEach hook

        // Click the actions menu of the first item
        await page.locator(".p-datatable-tbody tr:not(.p-datatable-empty-message)").first().locator("button").click();

        // Verify menu options
        await expect(page.getByRole("menuitem", { name: "Edit" })).toBeVisible();
        await expect(page.getByRole("menuitem", { name: "Delete" })).toBeVisible();

        // Click outside to close menu
        await page.click("h1");
    });

    test("Pagination controls are visible", async ({ page }) => {
        await page.goto("/items");

        // Wait for data load
        await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
        await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

        // Verify pagination controls
        await expect(page.locator(".p-paginator")).toBeVisible();

        // Verify rows per page options match the implementation
        await page.getByLabel('Rows per page').click();
        await expect(page.getByLabel('5', { exact: true })).toBeVisible();
        await expect(page.getByLabel('10', { exact: true })).toBeVisible();
        await expect(page.getByLabel('20', { exact: true })).toBeVisible();
        await expect(page.getByLabel('50', { exact: true })).toBeVisible();

        // Click outside to close dropdown
        await page.click("h1");
    });

    test("Can successfully edit an existing item", async ({ page }) => {
        let updatedTitle: string | null = null;

        try {
            await page.goto("/items");

            // Wait for data load
            await page.getByTestId('loading-item-data').waitFor({ state: 'visible' });
            await page.getByTestId('loading-item-data').waitFor({ state: 'hidden' });

            // Item was already created in beforeEach hook

            // Now edit the item
            updatedTitle = await test.step("Edit the existing item", async () => {
                // Find the row with our test item in the DataTable
                const itemRow = page.locator('tr', { has: page.getByText(createdTitle!, { exact: true }) });

                // Click actions menu for this item
                await itemRow.getByRole('button').click();

                // Click edit option
                await page.getByRole("menuitem", { name: "Edit" }).click();

                // Wait for dialog to appear
                const dialog = page.getByRole("dialog");
                await expect(dialog).toBeVisible();

                // Update the fields
                const newTitle = `${createdTitle} (edited)`;
                const updatedDescription = "This description has been edited";
                await page.getByPlaceholder("Title").clear();
                await page.getByPlaceholder("Title").fill(newTitle);
                await page.getByPlaceholder("Description").clear();
                await page.getByPlaceholder("Description").fill(updatedDescription);

                // Save changes
                await page.getByRole("button", { name: "Save" }).click();

                // Wait for dialog to close and changes to apply
                await expect(dialog).not.toBeVisible();

                // Verify changes appear in the table
                await expect(page.getByText(newTitle)).toBeVisible();
                await expect(page.getByText(updatedDescription)).toBeVisible();

                // Update the createdTitle for cleanup
                createdTitle = newTitle;
                return newTitle;
            });
        } finally {
            // No cleanup needed here, afterEach will handle it
        }
    });

});
