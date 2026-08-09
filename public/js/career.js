(function () {
  const board = document.querySelector("[data-job-board]");
  const filters = document.querySelectorAll("[data-filter]");
  const roleSelect = document.querySelector("#role");
  let jobs = [];
  let activeFilter = "All";
  const fallbackJobs = [
    {
      role: "Core Banking Integration Engineer",
      department: "Engineering",
      type: "Full-time",
      location: "Dharmapuri (On-site)",
      isRemote: false,
      description: "You'll work directly on CBS platforms - integrations, customizations, data mapping, and deployment support. You know banking middleware and you're not afraid of legacy codebases.",
      requirements: ["2+ years in banking IT", "Java/Spring Boot", "CBS experience (Finacle or BaNCS preferred)"]
    },
    {
      role: "React Frontend Developer",
      department: "Engineering",
      type: "Full-time",
      location: "Remote",
      isRemote: true,
      description: "You'll build and maintain client-facing dashboards and internal portals. Clean code, component reuse, and performance matter to us.",
      requirements: ["1+ years with React", "REST API integration", "Solid CSS skills"]
    },
    {
      role: "Business Analyst - Banking Domain",
      department: "Banking",
      type: "Full-time",
      location: "Dharmapuri (On-site)",
      isRemote: false,
      description: "You'll bridge the gap between our clients' banking operations and our technical teams. You should be able to read a BRD and translate it into a spec that developers actually use.",
      requirements: ["Banking domain experience", "Strong documentation skills", "Client-facing communication"]
    },
    {
      role: "HR Executive",
      department: "HR",
      type: "Full-time",
      location: "Dharmapuri (On-site)",
      isRemote: false,
      description: "Manage recruitment pipelines, onboarding, payroll coordination, and employee engagement. You should be organized and people-first.",
      requirements: ["1+ years in HR", "Familiarity with HRMS tools"]
    }
  ];

  function textNode(value) {
    const node = document.createTextNode(String(value ?? ''));
    return node;
  }

  function createJobCard(job) {
    const article = document.createElement('article');
    article.className = 'card job-card';

    const title = document.createElement('h3');
    title.textContent = job.role;

    const meta = document.createElement('div');
    meta.className = 'job-meta';
    [job.department, job.type, job.location].forEach((item) => {
      const badge = document.createElement('span');
      badge.textContent = item;
      meta.appendChild(badge);
    });

    const description = document.createElement('p');
    description.textContent = job.description;

    const list = document.createElement('ul');
    list.className = 'simple-list';
    (job.requirements || []).forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-primary';
    button.textContent = 'Apply Now';
    button.dataset.apply = job.role;
    button.addEventListener('click', () => {
      if (roleSelect) roleSelect.value = job.role;
      const form = document.querySelector('#application-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    article.append(title, meta, description, list, button);
    return article;
  }

  function skeleton() {
    if (!board) return;
    board.innerHTML = '';
    ['skeleton', 'skeleton', 'skeleton'].forEach(() => {
      const div = document.createElement('div');
      div.className = 'skeleton';
      board.appendChild(div);
    });
  }

  function render() {
    if (!board) return;
    board.innerHTML = '';

    const visible = activeFilter === 'All'
      ? jobs
      : jobs.filter((job) => [job.department, job.type, job.location, job.isRemote ? 'Remote' : 'On-site'].some((value) => String(value).includes(activeFilter)));

    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'lead';
      empty.textContent = 'No open roles match this filter right now.';
      board.appendChild(empty);
      return;
    }

    visible.forEach((job) => board.appendChild(createJobCard(job)));
  }

  function populateRoles() {
    if (!roleSelect) return;
    roleSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a role';
    roleSelect.appendChild(defaultOption);

    jobs.forEach((job) => {
      const option = document.createElement('option');
      option.value = job.role;
      option.textContent = job.role;
      roleSelect.appendChild(option);
    });
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('active', item === button));
      render();
    });
  });

  async function fetchJobs() {
    skeleton();
    try {
      const response = await fetch('/api/careers');
      const payload = await response.json();
      jobs = payload.data && payload.data.length ? payload.data : fallbackJobs;
    } catch (error) {
      jobs = fallbackJobs;
    }
    populateRoles();
    render();
  }

  fetchJobs();
})();
