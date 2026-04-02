const projectsData = [
      { id: 1, 
        title: 'Bukup - Event Management Platform', 
        description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequatur corrupti ex quasi ullam officia odio temporibus, nulla quia possimus doloremque. Eum quas unde alias accusantium.', 
        image: 'img/a1.jpg', 
        platform: 'Webflow', 
        industry: 'Fintech', 
        category: 'featured' 
      },
      { id: 2, 
        title: 'SaaS Dashboard', 
        description: 'Analytics dashboard for tracking business metrics in real-time.', 
        image: 'img/a2.jpg', 
        platform: 'React', industry: 'Technology', category: 'frontend' },
      { id: 3, 
        title: 'Healthcare Portal', 
        description: 'Patient management with appointment scheduling and medical records.', 
        image: 'img/a3.jpg', 
        platform: 'Vue.js', 
        industry: 'Healthcare', 
        category: 'featured' 
      },
      { id: 4, 
        title: 'Marketing Website', 
        description: 'Responsive marketing site with CMS integration for content management.', 
        image: 'img/a4.jpg', 
        platform: 'Webflow', 
        industry: 'Marketing', 
        category: 'personal' 
      },
      { id: 5, 
        title: 'Payment Gateway', 
        description: 'Secure payment processing system with multiple currency support.', 
        image: 'img/a5.jpg', 
        platform: 'Node.js', 
        industry: 'Fintech', 
        category: 'featured' 
      },
      { id: 6, 
        title: 'Learning Management System', 
        description: 'Online course platform with progress tracking and certificates.', 
        image: 'img/a6.jpg', 
        platform: 'Django', 
        industry: 'Education', 
        category: 'personal' 
      }
    ];

    let currentFilter = 'featured';

    const filterEl = document.getElementById('filterSelect');
    const triggerText = filterEl.querySelector('.trigger-text');
    const dropdown = filterEl.querySelector('.custom-select__dropdown');

    // Toggle dropdown
    filterEl.querySelector('.custom-select__trigger').addEventListener('click', () => {
      filterEl.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.custom-select')) filterEl.classList.remove('open');
    });

    // Option selection
    dropdown.addEventListener('click', (e) => {
      const opt = e.target.closest('.custom-select__option');
      if (!opt || !opt.dataset.value || opt.hasAttribute('disabled')) return;

      currentFilter = opt.dataset.value;
      triggerText.textContent = opt.textContent.trim();
      dropdown.querySelectorAll('.custom-select__option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      filterEl.classList.remove('open');

      applyFilter();
    });

    function applyFilter() {
      let filtered;

      if (currentFilter.startsWith('industry-')) {
        const industry = currentFilter.replace('industry-', '');
        const industryMap = {
          fintech: 'Fintech', technology: 'Technology', healthcare: 'Healthcare',
          marketing: 'Marketing', education: 'Education'
        };
        filtered = projectsData.filter(p => p.industry === industryMap[industry]);
      } else {
        filtered = projectsData.filter(p => p.category === currentFilter);
      }

      displayProjects(filtered);
    }

    function displayProjects(projects) {
      const grid = document.getElementById('projectsGrid');
      grid.innerHTML = '';
      if (projects.length === 0) {
        grid.innerHTML = `
      <div class="no-projects">
        <div class="no-projects-text">No projects found</div>
        <div class="no-projects-subtext">Try adjusting your filters</div>
      </div>`;
        return;
      }
      projects.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'projectCard';
        card.style.animationDelay = `${i * 40}ms`;
        card.innerHTML = `
      <div class="projectCard__title"><h3>${p.platform} · ${p.industry}</h3></div>
      <div class="projectCard__desc">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </div>
      <div class="projectCard__image-wrap"><img src="${p.image}"></div>`;
        grid.appendChild(card);
      });
    }

    // Initial render
    applyFilter();