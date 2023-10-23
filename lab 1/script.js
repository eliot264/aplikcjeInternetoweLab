class Task{
    constructor(name, date, isChecked){
        this.name = name;
        this.date = date;
        this.isChecked = isChecked;
        this.id = TaskList.tasks.length;
    }

    get name(){
        return this._name;
    }

    set name(name){
        if(typeof name != "string"){
            throw new Error('Parameter name is not a string');
        }

        if(name.length < 3 || name.length > 255){
            throw new Error("Name length must be between 3 and 255");
        }

        this._name = name;
    }

    get date(){
        return this._date;
    }

    set date(date){
        if(!(date instanceof Date)){
            throw new Error('Parameter date is not a date');
        }

        if(!isNaN(date)){
            if(date.getTime() <= Date.now()){
                throw new Error("Task date must be a future date");
            }
        }

        this._date = date;
    }

    get isChecked(){
        return this._isChecked;
    }

    set isChecked(isChecked){
        if(typeof isChecked != "boolean"){
            throw new Error('Parameter isChecked is not a boolean');
        }

        this._isChecked = isChecked;
    }

    get id(){
        return this._id;
    }

    set id(id){
        this._id = id;
    }

    toHTML(){
        var mainDiv = document.createElement("div");
        mainDiv.id = "task" + this.id;
        mainDiv.style = "width: 100%; display: flex; flex-direction: row; align-items: center; justify-content: space-between;";

        if(this.isChecked == true){
            mainDiv.style.textDecoration = 'line-through';
        }

        var checkbox = document.createElement("input");
        checkbox.id = mainDiv.id + "Checkbox";
        checkbox.type = "checkbox"
        checkbox.checked = this.isChecked;
        checkbox.style = "margin-right: 10px;"
        checkbox.onchange = function(){
            let currentId = this.id.replace("task", "").replace("Checkbox", "");
            TaskList.tasks[currentId].isChecked = !TaskList.tasks[currentId].isChecked;

            let taskDiv = document.getElementById('task' + currentId);
            taskDiv.style.textDecoration = TaskList.tasks[currentId].isChecked == true ? 'line-through' : 'none';

            let taskCheckbox = document.getElementById('task' + currentId + 'Checkbox')
            taskCheckbox.checked = TaskList.tasks[currentId].isChecked;
        };
        mainDiv.appendChild(checkbox);

        var nameLabel = document.createElement("p");
        nameLabel.id = mainDiv.id + "NameLabel";
        if(TaskList.searchPhrase.length >= 2){
            if(this.name.includes(TaskList.searchPhrase)){
                let markedText = "<mark>" + TaskList.searchPhrase + "</mark>";
                nameLabel.innerHTML = this.name.replace(TaskList.searchPhrase, markedText);
            }
            else{
                return null;
            }
        }
        else{
            nameLabel.innerText = this.name;
        }
        nameLabel.style = "margin-right: 10px; cursor: default;";
        nameLabel.onclick = function(event){
            if(TaskList.currentEditedId < 0){
                let currentId = this.id.replace("task", "").replace("NameLabel", "");
                let task = TaskList.tasks[currentId];
                document.getElementById("taskListDiv").replaceChild(task.toEditHTML(), document.getElementById("task" + currentId));
                event.stopPropagation();
                TaskList.currentEditedId = currentId;
            }
        };
        nameLabel.onmouseenter = function(){
            this.style["cursor"] = "pointer";
        };
        mainDiv.appendChild(nameLabel);

        var dateLabel = document.createElement("p");
        dateLabel.id = mainDiv.id + "DateLabel";
        dateLabel.innerText = isNaN(this.date) ? "empty" : this.date.toDateString();
        dateLabel.style = "margin-right: 10px;";
        mainDiv.appendChild(dateLabel);

        var deleteButton = document.createElement("button");
        deleteButton.id = mainDiv.id + "DeleteButton";
        deleteButton.innerText = "❌";
        deleteButton.onclick = function(){
            let currentId = this.id.replace("task", "").replace("DeleteButton", "");
            TaskList.removeTask(currentId);
            TaskList.buildList();
        }
        mainDiv.appendChild(deleteButton);

        return mainDiv;
    }

    toEditHTML(){
        let editDiv = document.createElement("div");
        editDiv.id = "task" + this.id + "Edit";
        editDiv.style = "width: 100%; display: flex; flex-direction: row; align-items: center; justify-content: space-between;";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = editDiv.id + "Checkbox";
        checkbox.checked = this.isChecked;
        checkbox.onclick = function(event) {event.stopPropagation();};
        editDiv.appendChild(checkbox);

        let textBox = document.createElement("input");
        textBox.type = "text";
        textBox.id = editDiv.id + "Textbox";
        textBox.value = this.name;
        textBox.onclick = function(event) {event.stopPropagation();};
        editDiv.appendChild(textBox);

        let datePicker = document.createElement("input");
        datePicker.type = "date";
        datePicker.id = editDiv.id + "Date";
        datePicker.valueAsDate = this.date;
        datePicker.onclick= function(event) {event.stopPropagation();};
        editDiv.appendChild(datePicker);

        let saveButton = document.createElement("button");
        saveButton.id = editDiv.id + "Button";
        saveButton.innerText = "💾";
        saveButton.onclick = function(){
            let currentId = this.id.replace("task", "").replace("EditButton", "");
            let task = TaskList.tasks[currentId];

            try{
                TaskList.saveChanges(document.getElementById("task" + currentId + "EditTextbox").value, document.getElementById("task" + currentId + "EditDate").valueAsDate, document.getElementById("task" + currentId + "EditCheckbox").checked);
                TaskList.currentEditedId = -1;
                document.getElementById("taskListDiv").replaceChild(task.toHTML(), document.getElementById("task" + currentId + "Edit"));
            }
            catch(e){
                alert(e);
            }
        };
        editDiv.appendChild(saveButton);
        return editDiv;
    }
}

class TaskList{

    static tasks = [];
    static searchPhrase = "";
    static currentEditedId = -1;

    static addTask(task){
        if(task instanceof Task){
            TaskList.tasks.push(task);
            TaskList.saveToLocalStorage();
        }
        else{
            throw new Error('Parameter task is not a Task');
        }
    }
    static createTask(){
        let name = document.getElementById("addItemTextBox").value;
        let date = new Date(document.getElementById("addItemDate").value);

        try{
            TaskList.addTask(new Task(name, date, false));
            document.getElementById("taskListDiv").appendChild(TaskList.tasks[TaskList.tasks.length - 1].toHTML());
    
            document.getElementById("addItemTextBox").value = "";
            document.getElementById("addItemDate").value = "";
        }
        catch(e){
            alert(e);
        }

    }
    static removeTask(id){
        if(id < 0 || id > TaskList.tasks.length - 1){
            throw new Error('Parameter id must be between 0 and ' + TaskList.tasks.length - 1);
        }
        else{
            TaskList.tasks.splice(id, 1);
            for(let i = 0; i < TaskList.tasks.length; i++){
                TaskList.tasks[i].id = i;
            }
        }
    }
    static searchTasks(){
        TaskList.searchPhrase = document.getElementById("searchTextBox").value;
        TaskList.buildList();
    }

    static buildList(){
        document.getElementById("taskListDiv").innerHTML = "";

        for(var task of TaskList.tasks){
            let taskHTML = task.toHTML();

            if(taskHTML != null){
                document.getElementById("taskListDiv").appendChild(taskHTML);
            }
        }
    }

    static saveChanges(name, date, isChecked){
        let task = TaskList.tasks[TaskList.currentEditedId];
        task.name = name;
        task.date = date;
        task.isChecked = isChecked;

        TaskList.saveToLocalStorage();
    }

    static saveToLocalStorage(){
        window.localStorage.setItem("tasks", JSON.stringify(TaskList.tasks));
    }

    static loadFromLocaLStorage(){
        let tasks =  JSON.parse(window.localStorage.getItem("tasks"));
        if(tasks != null){
            for(let task of tasks){
                TaskList.tasks.push(new Task(task._name, new Date(task._date), task._isChecked));
            }
            TaskList.buildList();
        }  
    }
}

var bodyOnClick = function(){
        if(TaskList.currentEditedId >= 0){
        let taskEditDiv = document.getElementById("task" + TaskList.currentEditedId + "Edit");

        if(taskEditDiv != null){
            let saveButton = document.getElementById("task" + TaskList.currentEditedId + "EditButton");
            saveButton.onclick();
        }
    }
}