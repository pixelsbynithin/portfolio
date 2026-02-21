const viewBtn = document.getElementById("viewAllProjBtn");
const sliderView = document.getElementById("projSliderView");
const allProjectsView = document.getElementById("allProjectsView");

viewBtn.addEventListener("click", () => {
  sliderView.classList.toggle("hidden");
  allProjectsView.classList.toggle("hidden");

  const isAllVisible = !allProjectsView.classList.contains("hidden");

  viewBtn.textContent = isAllVisible
    ? "Back to Slider"
    : "View All Projects";
});
