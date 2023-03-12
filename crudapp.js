class Project {
    constructor(title) {
        this.title = title;
        this.steps = [];
    }

    addSteps(title, date) {
        this.steps.push(new Step(title, date));
    }
}

class Step {
    static idCounter = 0;
    constructor(title, date) {
        this.title = title;
        this.date = date;
        this._id = Step.idCounter++;
    }
}

class AllProjects {
    static url = 'https://6406aea577c1a905a0e079b5.mockapi.io/V1/knitting';

    static getAllProjects() {
        return $.get(this.url);
    }

    static getProject(id) {
        return $.get(this.url + `/${id}`);
    }

    static createProject(project) {
        return $.post(this.url, project);
    }

    static updateProject(project) { //updating a project, grabbing the id of the project wer're updating
        return $.ajax({
            url: this.url + `/${project._id}`,
            dataType: 'json',
            data: JSON.stringify(project),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteProject(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static projects;

    static getAllProjects() {
        AllProjects.getAllProjects().then(projects => this.render(projects));
    }

    static createProject(title) {
        AllProjects.createProject(new Project(title))
            .then(() => {
                return AllProjects.getAllProjects();
            })
            .then((projects) => this.render(projects))
    }

    static deleteProject(id) {
        AllProjects.deleteProject(id) //delete a project
            .then(() => {
                return AllProjects.getAllProjects(); //http request to get all the current projects
            })
            .then((projects) => this.render(projects)); //then re-render those projects
    }

    static addStep(id) {
        for (let project of this.projects) {
            if (project._id == id) {
                project.steps.push(new Step($(`#${project._id}-title`).val(), $(`#${project._id}-goal-date`).val())); //first $ is jquery method, template literal, # finding by id
                AllProjects.updateProject(project)
                    .then(() => {
                        return AllProjects.getAllProjects();
                    })
                    .then((projects) => this.render(projects));
            }
        }
    }

    static deleteStep(projectId, stepId) {
        for (let project of this.projects) {
            if (project._id == projectId) {
                for (let step of project.steps) {
                    if (step._id == stepId) {
                        project.steps.splice(project.steps.indexOf(step), 1);
                        AllProjects.updateProject(project)
                            .then(() => {
                                return AllProjects.getAllProjects();
                            })
                            .then((projects) => this.render(projects));
                    }
                }
            }
        }
    }

    static render(projects) {
        this.projects = projects;
        $(`#app`).empty();
        for (let project of projects) {
            $(`#app`).prepend(
                `<div id="${project._id}" class="container bg-light p-5 pt-0 mt-3 rounded col col-lg-8">
                    <div class="row justify-content-md-center">
                        <div class="col">
                            <div class="card-header p-3">
                            <h3 class="text-center p-1">${project.title}</h3>
                            </div>
                            <img src="card-header-image.png" alt="shapes-design" class="img-fluid">
                            <button class="btn btn-dark mt-2" onclick="DOMManager.deleteProject('${project._id}')">Remove</button>
                            </div>
                                <div class="card-body">
                                    <div class="card">
                                        <div class="row justify-content-md-center">
                                            <div class="col col-lg-8">
                                            <input type="text" id="${project._id}-title" class="form-control form-control-lg w-75" placeholder="Project Steps"
                                            </div>
                                        <div class="col col-lg-8">
                                        <p class="m-3"><strong>Goal Date:</p> <input type="date" id="${project._id}-goal-date" class="form-control w-75" placeholder="Goal Date"
                                        </div>
                                    </div>
                                    <button id="${project._id}-new-step" onclick="DOMManager.addStep('${project._id}')" class="btn btn-info form-control w-25">Add</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div><br>`
            );
            console.log(project.title);
            for (let step of project.steps) {
                $(`#${project._id}`).find('.card-body').append(
                    `<p>
                    <div class="mt-4">
                    <span class="title" id="title-${step._id}"><strong>To do: </strong> ${step.title}</span><br>
                    <span class="date" id="goal-date-${step._id}"><strong>Goal Date: </strong> ${step.date}</span>
                    <button class="btn btn-light" onclick="DOMManager.deleteStep('${project._id}', '${step._id}')">Complete</button>
                    </div>`

                )
            }
        }
    }
}

$('#create-new-project').click(() => {
    DOMManager.createProject($('#new-project-title').val());
    $('#new-project-title').val('');
});

DOMManager.getAllProjects();
