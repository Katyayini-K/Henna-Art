// Services Tabs Initialization
document.addEventListener('DOMContentLoaded', function () {
  function initServiceTabs(container) {
    const tabs = container.querySelectorAll('.service-tab');
    const sections = container.querySelectorAll('.service-section');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const targetSection = container.querySelector(`#${targetId}`);
        if (targetSection) {
          targetSection.classList.add('active');
        }
      });
    });
  }

  // Select all service containers
  const containers = document.querySelectorAll('.bg-white.rounded-xl.shadow-lg');
  containers.forEach(container => {
    initServiceTabs(container);
  });
});
