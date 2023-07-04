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
        isValid = isValid && validateInput.value >= validateInput.min;
    }
    if(validateInput.max != null && typeof validateInput.value === 'number'){
        isValid = isValid && validateInput.value <= validateInput.max;
    }
    return isValid;
}
abstract class Component<T extends HTMLElement,U extends HTMLElement>{
    templateElement : HTMLTemplateElement;
    hostElement:T;
    element:U;

    constructor(
        templateId:string,
        hostElementId:string,
        insertAtStart:boolean,
        newElementId?:string,
    ) {
        this.templateElement =<HTMLTemplateElement> document.getElementById(templateId);
        this.hostElement = <T> document.getElementById(hostElementId);
        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = <U> importedNode.firstElementChild;
        if(newElementId){
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    private attach(insertAtBeginning:boolean){
        this.hostElement.insertAdjacentElement(insertAtBeginning ?'afterbegin':'beforeend',this.element);
    }
    abstract configure():void;
    abstract renderContent():void;

}
//Drag & Drop Interfaces
interface Draggable{
    dragStartHandler(event:DragEvent):void;
    dragEndHandler(event:DragEvent):void;
}
interface DragTarget{
    dragOverHandler(event:DragEvent):void;
    dropHandler(event:DragEvent):void;
    dragLeaveHandler(event:DragEvent):void;
}
enum ProjectStatus{Active,Finished}
class Project{
    constructor(
        public id:string,
        public title:string,
        public description:string,
        public people:number,
        public status:ProjectStatus
        )
    {

    }
}
type Listener<T> = (items:T[]) =>void;
class State <T>{
    protected listeners:Listener<T>[]=[];
    addListener(listenerFn:Listener<T>){
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State<Project>{
    private project:Project[]=[];


    private static instance :ProjectState;

    private constructor() {
        super();
    }
    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title:string,description:string,numOfPeople:number){
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        );

        this.project.push(newProject);
        this.updateListener();

    }
    moveProject(projectId:string,newStatus:ProjectStatus){
        const project = this.project.find(prj =>prj.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListener();
        }
    }
    private updateListener(){
        for(const listenerFn of this.listeners){
            listenerFn(this.project.slice());
        }
    }
}

const prjState = ProjectState.getInstance();
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
    private project:Project;
    get persons(){
        if(this.project.people === 1){
            return '1 person';
        }else{
            return `${this.project.people} persons`;
        }
    }
    constructor(hostId:string,project:Project){
        super('single-project',hostId,true,project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    @AutoBind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain',this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }
    @AutoBind
    dragEndHandler(_: DragEvent): void {
        console.log('DragEnd');
    }

    configure(){
        this.element.addEventListener('dragstart',this.dragStartHandler)
        this.element.addEventListener('dragend',this.dragEndHandler)
    };
    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' 투입됨';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{

    assignedProjects:Project[];
    constructor(private type:'active'|'finished') {
        super('project-list','app',false,`${type}-projects`);
        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }
    @AutoBind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }

    }
    @AutoBind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        prjState.moveProject(prjId,this.type ==='active'? ProjectStatus.Active : ProjectStatus.Finished);
    }
    @AutoBind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }
    private renderProjects(){
        const listEl =<HTMLUListElement> document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for(const prjItem of this.assignedProjects){
            new ProjectItem(this.element.querySelector('ul')!.id,prjItem);
        }
    }
    configure() {
        this.element.addEventListener('dragover',this.dragOverHandler)
        this.element.addEventListener('drop',this.dropHandler)
        this.element.addEventListener('dragleave',this.dragLeaveHandler)
        prjState.addListener((projects:Project[])=>{
            const relevantProject = projects.filter(prj=> {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProject;
            this.renderProjects();
        });
    }

    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase()+' PROJECTS';
    }

}

const activePrjList = new ProjectList('active');
const finishPrjList = new ProjectList('finished');
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{

    titleInputElement:HTMLInputElement;
    descriptionInputElement:HTMLInputElement;
    peopleInputElement:HTMLInputElement;
    constructor() {
        super('project-input','app',true,'user-input');
        this.titleInputElement = <HTMLInputElement> this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement> this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement> this.element.querySelector('#people');
        this.configure();
    }
    configure(){
        this.element.addEventListener('submit',this.submitHandler)
    }
    renderContent(): void {
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



}
const prjInput = new ProjectInput();