const AutoBind = (_:any,__:string,descriptor:PropertyDescriptor) =>{
    const originalMethod = descriptor.value;
    const adjDescriptor :PropertyDescriptor = {
        configurable:true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

interface Validatable{
    value:string | number;
    required?:boolean;
    minLength?:number;
    maxLength?:number;
    min?:number;
    max?:number;
}
const validate = (validateInput:Validatable)=>{
    let isValid = true;
    if(validateInput.required){
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }
    if(validateInput.minLength != null && typeof validateInput.value === 'string'){
        isValid = isValid && validateInput.value.length > validateInput.minLength;
    }
    if(validateInput.maxLength != null && typeof validateInput.value === 'string'){
        isValid = isValid && validateInput.value.length < validateInput.maxLength;
    }
    if(validateInput.min != null && typeof validateInput.value === 'number'){
        isValid = isValid && validateInput.value > validateInput.min;
    }
    if(validateInput.max != null && typeof validateInput.value === 'number'){
        isValid = isValid && validateInput.value < validateInput.max;
    }
    return isValid;
}

class ProjectState {
    private project:any[]=[];
    private listeners:any[]=[];

    private static instance :ProjectState;

    private constructor() {

    }
    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn:Function){
        this.listeners.push(listenerFn);
    }
    addProject(title:string,description:string,numOfPeople:number){
        const newProject = {
            id:Math.random().toString(),
            title,
            description,
            numOfPeople
        }
        this.project.push(newProject);
        for(const listenerFn of this.listeners){
            listenerFn(this.project.slice());
        }

    }
}

const prjState = ProjectState.getInstance();
class ProjectList{
    templateElement : HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLElement;
    assignedProjects:any[];
    constructor(private type:'active'|'finished') {
        this.templateElement =<HTMLTemplateElement> document.getElementById('project-list');
        this.hostElement =<HTMLDivElement> document.getElementById('app');
        this.assignedProjects = [];
        const importedNode = document.importNode(
            this.templateElement.content,
            true
        )
        this.element = <HTMLElement> importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        prjState.addListener((projects:any[])=>{
            this.assignedProjects = projects;
            this.renderProjects();
        });
        this.attach();
        this.renderContent();
    }
    private renderProjects(){
        const listEl =<HTMLUListElement> document.getElementById(`${this.type}-projects-list`);
        for(const prjItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase()+' PROJECTS';
    }
    private attach(){
        this.hostElement.insertAdjacentElement('beforeend',this.element)
    }
}

const activePrjList = new ProjectList('active');
const finishPrjList = new ProjectList('finished');
class ProjectInput {
    templateElement:HTMLTemplateElement;
    hostElement:HTMLDivElement;
    element:HTMLFormElement;
    titleInputElement:HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;
    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input');
        this.hostElement = <HTMLDivElement>document.getElementById('app');

        const importedNode = document.importNode(this.templateElement.content,true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        console.log('this.element',this.element);
        this.element.id = 'user-input';

        this.titleInputElement = <HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement> this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement> this.element.querySelector('#people');

        this.configure();
        this.attach();
    }
    private gatherUserInput():[string,string,number] | void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable:Validatable = {
            value:enteredTitle,
            required:true
        }
        const descriptionValidatable:Validatable = {
            value:enteredDescription,
            required:true,
            minLength:5
        }
        const peopleValidatable:Validatable = {
            value:+enteredPeople,
            required:true,
            min:1,
            max:5
        }
        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ){
            alert('Invalid input! plz try again!!');
            return;
        }else{
            return [enteredTitle,enteredDescription,+enteredPeople];
        }
    }
    private clearInput(){
        this.titleInputElement.value = '';
        this.peopleInputElement.value = '';
        this.descriptionInputElement.value = '';

    }
    @AutoBind
    private submitHandler(event:Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput;
            prjState.addProject(title,desc,people);
            this.clearInput();
        }
    }
    private configure(){
        this.element.addEventListener('submit',this.submitHandler)
    }
    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin',this.element)
    }
}
const prjInput = new ProjectInput();