import { expect, test } from "@playwright/test"
import { firstSuperuser, firstSuperuserPassword } from "./config"
import { createUser } from "./utils/privateApi"
import { randomEmail, randomPassword } from "./utils/random"
import { logInUser, logOutUser } from "./utils/user"

const tabs = ["My profile", "Password", "Appearance", "Danger zone"]

// User Information

test("My profile tab is active by default", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.getByRole("tab", { name: "My profile" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})

test("All tabs are visible", async ({ page }) => {
  await page.goto("/settings")
  for (const tab of tabs) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible()
  }
})

test.describe("Edit user full name and email successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user name with a valid name", async ({ page }) => {
    const email = randomEmail()
    const updatedName = "Test User 2"
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "My profile" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Full name").fill(updatedName)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("User updated successfully")).toBeVisible()

    // Check if the new name is displayed on the page
    await expect(
      page.getByText(updatedName, { exact: true }),
    ).toBeVisible()
  })

  test("Edit user email with a valid email", async ({ page }) => {
    const email = randomEmail()
    const updatedEmail = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "My profile" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Email").fill(updatedEmail)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("User updated successfully")).toBeVisible()
    await expect(
      page.getByText(updatedEmail, { exact: true }),
    ).toBeVisible()
  })
})

test.describe("Edit user with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Edit user email with an invalid email", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const invalidEmail = ""

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "My profile" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Email").fill(invalidEmail)
    await page.locator("body").click()
    await expect(page.getByText("Email is required")).toBeVisible()
  })

  test("Cancel edit action restores original name", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const updatedName = "Test User"

    const user = await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "My profile" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Full name").fill(updatedName)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(
      page
        .getByText(user.full_name as string, { exact: true }),
    ).toBeVisible()
  })

  test("Cancel edit action restores original email", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const updatedEmail = randomEmail()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "My profile" }).click()
    await page.getByRole("button", { name: "Edit" }).click()
    await page.getByLabel("Email").fill(updatedEmail)
    await page.getByRole("button", { name: "Cancel" }).first().click()
    await expect(page.getByText(email, { exact: true })).toBeVisible()
  })
})

// Change Password

test.describe("Change password successfully", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password successfully", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const newPassword = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Password" }).click()
    await page.getByPlaceholder("Current Password").fill(password)
    await page.getByPlaceholder("New Password").fill(newPassword)
    await page.getByPlaceholder("Confirm Password").fill(newPassword)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(page.getByText("Password updated successfully.")).toBeVisible()

    await logOutUser(page)

    // Check if the user can log in with the new password
    await logInUser(page, email, newPassword)
  })
})

test.describe("Change password with invalid data", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("Update password with weak passwords", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()
    const weakPassword = "weak"

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Password" }).click()
    await page.getByPlaceholder("Current Password").fill(password)
    await page.getByPlaceholder("New Password").fill(weakPassword)
    await page.getByPlaceholder("Confirm Password").fill(weakPassword)
    await expect(
      page.getByText("Password must be at least 8 characters")
    ).toBeVisible()
  })

  test("New password and confirmation password do not match", async ({
    page,
  }) => {
    const email = randomEmail()
    const password = randomPassword()
    const newPassword = randomPassword()
    const confirmPassword = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Password" }).click()
    await page.getByPlaceholder("Current Password").fill(password)
    await page.getByPlaceholder("New Password").fill(newPassword)
    await page.getByPlaceholder("Confirm Password").fill(confirmPassword)
    await expect(page.getByText('Passwords don\'t match')).toBeVisible()
  })

  test("Current password and new password are the same", async ({ page }) => {
    const email = randomEmail()
    const password = randomPassword()

    await createUser({ email, password })

    // Log in the user
    await logInUser(page, email, password)

    await page.goto("/settings")
    await page.getByRole("tab", { name: "Password" }).click()
    await page.getByPlaceholder("Current Password").fill(password)
    await page.getByPlaceholder("New Password").fill(password)
    await page.getByPlaceholder("Confirm Password").fill(password)
    await page.getByRole("button", { name: "Save" }).click()
    await expect(
      page.getByText("New password cannot be the same as the current one")
    ).toBeVisible()
  })
})

// Appearance

test("Appearance tab is visible", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()
  await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible()
})

test("User can switch from light mode to dark mode and vice versa", async ({
  page,
}) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark-mode")
    )
  ) {
    await page
      .getByLabel('Light Mode')
      .click()
  }

  // Check if light mode (no class)
  let isLightMode = await page.evaluate(() => 
    document.documentElement.classList.length === 0
  )
  expect(isLightMode).toBe(true)

  // Switch to dark mode
  await page
    .getByLabel('Dark Mode')
    .click()
  
  // Check if dark mode class is applied
  const isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark-mode")
  )
  expect(isDarkMode).toBe(true)

  // Switch back to light mode
  await page
    .getByLabel('Light Mode')
    .click()
  
  // Check if light mode again (no class)
  isLightMode = await page.evaluate(() => 
    document.documentElement.classList.length === 0
  )
  expect(isLightMode).toBe(true)
})

test("Selected mode is preserved across sessions", async ({ page }) => {
  await page.goto("/settings")
  await page.getByRole("tab", { name: "Appearance" }).click()

  // Ensure the initial state is light mode
  if (
    await page.evaluate(() =>
      document.documentElement.classList.contains("dark-mode")
    )
  ) {
    await page
      .getByLabel('Light Mode')
      .click()
  }

  // Check if light mode (no class)
  const isLightMode = await page.evaluate(() => 
    document.documentElement.classList.length === 0
  )
  expect(isLightMode).toBe(true)

  // Switch to dark mode
  await page
    .getByLabel('Dark Mode')
    .click()
  
  // Check if dark mode
  let isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark-mode")
  )
  expect(isDarkMode).toBe(true)

  await logOutUser(page)
  await logInUser(page, firstSuperuser, firstSuperuserPassword)

  // Check if dark mode is preserved after login
  isDarkMode = await page.evaluate(() =>
    document.documentElement.classList.contains("dark-mode")
  )
  expect(isDarkMode).toBe(true)
}) 