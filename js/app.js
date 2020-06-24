const container = document.querySelector('.container');
const filterAria = document.querySelector('.filter-aria');
const insideFilterAria = document.querySelector('.inside-filter-aria');
class Jobs {
	async getJobs() {
		try {
			let content = await fetch('data.json');
			let jobs = await content.json();

			jobs = jobs.map((item) => {
				let { id, company, logo, featured, position, postedAt, contract, location } = item;
				let newJob = item.new;
				let roleAndLevel = [];
				roleAndLevel.push(item.role);
				roleAndLevel.push(item.level);
				let filters = [];
				filters.push(...roleAndLevel, ...item.languages, ...item.tools);
				return { id, company, logo, featured, position, postedAt, contract, location, newJob, filters };
			});
			return jobs;
		} catch (e) {
			console.log(e);
		}
	}
}
let filterArry = [];
class UI {
	papulateJobs(jobs) {
		this.papulate(jobs);
	}

	clickedFilters() {
		document.addEventListener('click', (e) => {
			let { target } = e;
			if (target.classList.contains('custom-btn')) {
				let filtername = target.innerText;
				this.addToFilterArry(filtername);
				let jobs = Storage.getJobsByFilter(filterArry);
				this.papulateByFilter(jobs);
				this.displayFilters();
			} else if (target.classList.contains('remove-single-filter')) {
				let filtername = target.previousElementSibling.innerText;
				target.parentNode.parentNode.removeChild(target.parentNode);
				this.displayJobsAterRemoveFilter(filtername);
				let jobs = Storage.getJobsByFilter(filterArry);
				this.papulateByFilter(jobs);
				if (filterArry.length == 0) {
					let jobs = Storage.getJobs();
					this.papulateByFilter(jobs);
					filterAria.classList.remove('d-flex');
				}
			} else if (target.classList.contains('clear-filter')) {
				this.clearAllFilters();
				let jobs = Storage.getJobs();
				this.papulateByFilter(jobs);
			}
		});
	}
	addToFilterArry(filtername) {
		if (!filterArry.includes(filtername)) {
			filterArry.push(filtername);
		}
	}
	displayJobsAterRemoveFilter(filtername) {
		filterArry = filterArry.filter((item) => item != filtername);
	}
	displayFilters() {
		let result = '';
		for (let i = 0; i < filterArry.length; i++) {
			filterAria.classList.add('d-flex');
			result += `
			<div><button class="filter-btn my-2">${filterArry[i]}</button><i class="remove-single-filter fas fa-times"></i></div>
			`;
		}
		insideFilterAria.innerHTML = result;
	}
	papulateByFilter(jobs) {
		container.innerHTML = '';
		this.papulate(jobs);
	}
	papulate(jobs) {
		for (let i = 0; i < jobs.length; i++) {
			let div = document.createElement('div');
			div.className = 'single-job row mx-auto mt-5';
			let newJob = '';
			let featuredJob = '';
			if (jobs[i].newJob) {
				newJob = '<span class="new mx-2">New!</span>';
			} else {
				newJob = '';
			}
			if (jobs[i].featured) {
				featuredJob = '<span class="featured"> Featured </span>';
				div.classList.add('featured-border');
			} else {
				featuredJob = '';
			}

			div.innerHTML = `
            <div class="job-logo col-12 col-lg-1 pb-3 pb-lg-0 p-0 "><img src=${jobs[i].logo} alt=""></div>
            <div class="about col-12 col-lg-5 p-0 pl-0 pl-lg-5 pb-3 pb-lg-0">
            <div class="pb-2">
            <span class="company">${jobs[i].company}</span>${newJob}${featuredJob}
            </div>
            <div class="pb-2 level"> 
            ${jobs[i].position}
            </div>
            <div class="details">
             ${jobs[i].postedAt} . ${jobs[i].contract} . ${jobs[i].location}
            </div>
                 
            `;
			let skillsDiv = document.createElement('div');
			skillsDiv.className =
				'row justify-content-start justify-content-lg-end col-12 col-lg-6 p-0 my-auto mr-auto pt-2 pt-lg-0';
			let insideSkilss = '';

			let filters = jobs[i].filters;
			for (let i = 0; i < filters.length; i++) {
				insideSkilss += `<button class="btn custom-btn mt-3 mt-xl-auto languages">${filters[i]}</button>`;
			}

			skillsDiv.innerHTML = insideSkilss;
			div.appendChild(skillsDiv);
			container.appendChild(div);
		}
	}
	clearAllFilters() {
		filterArry = [];
		insideFilterAria.innerHTML = '';
		filterAria.classList.remove('d-flex');
	}
}
class Storage {
	static saveJobs(jobs) {
		localStorage.setItem('jobs', JSON.stringify(jobs));
	}
	static saveOriganJobs(jobs) {
		localStorage.setItem('origan-jobs', JSON.stringify(jobs));
	}
	static getJobs() {
		return JSON.parse(localStorage.getItem('jobs'));
	}
	static getJobsByFilter(filterArry) {
		let jobs = JSON.parse(localStorage.getItem('origan-jobs'));
		return jobs.filter((jobs) => filterArry.every((element) => jobs.filters.includes(element)));
	}
}
document.addEventListener('DOMContentLoaded', () => {
	let jobs = new Jobs();
	let ui = new UI();

	jobs
		.getJobs()
		.then((jobs) => {
			ui.papulateJobs(jobs);
			Storage.saveJobs(jobs);
			Storage.saveOriganJobs(jobs);
		})
		.then(() => {
			ui.clickedFilters();
		});
});
