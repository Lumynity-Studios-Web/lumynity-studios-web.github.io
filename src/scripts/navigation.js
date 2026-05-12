/* Nav dropdown toggle */

const navButton = document.getElementById("nav-button");
const navDropdown = document.getElementById("nav-dropdown");

// Restore nav state from last page
if (sessionStorage.getItem("navOpen") === "true") {
	navDropdown.classList.add("open");
}

navButton.addEventListener("click", function() {
	navDropdown.classList.toggle("open");
	sessionStorage.setItem("navOpen", navDropdown.classList.contains("open"));
});

// Close when clicking outside the nav
document.addEventListener("click", function(event) {
	const clickedInsideNav = navButton.contains(event.target) || navDropdown.contains(event.target);
	if (!clickedInsideNav) {
		navDropdown.classList.remove("open");
		sessionStorage.setItem("navOpen", "false");
	}
});