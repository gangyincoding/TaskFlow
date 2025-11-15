// TaskFlow - 待办事项应用
class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.initElements();
        this.attachEventListeners();
        this.render();
    }

    // 初始化DOM元素
    initElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    // 附加事件监听器
    attachEventListeners() {
        // 添加任务
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // 筛选按钮
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // 任务事件（事件委托）- 只添加一次
        this.taskList.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const id = parseInt(e.target.dataset.id);

            if (action === 'toggle') {
                this.toggleTask(id);
            } else if (action === 'delete') {
                this.deleteTask(id);
            }
        });
    }

    // 从localStorage加载任务
    loadTasks() {
        const tasksJson = localStorage.getItem('taskflow_tasks');
        return tasksJson ? JSON.parse(tasksJson) : [];
    }

    // 保存任务到localStorage
    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    // 添加新任务
    addTask() {
        const taskText = this.taskInput.value.trim();

        if (!taskText) {
            this.taskInput.focus();
            return;
        }

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.taskInput.value = '';
        this.taskInput.focus();
        this.render();
    }

    // 切换任务完成状态
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // 删除任务
    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);

        if (taskElement) {
            taskElement.classList.add('removing');

            setTimeout(() => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.render();
            }, 300);
        }
    }

    // 获取筛选后的任务
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    // 更新统计信息
    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
    }

    // 渲染任务列表
    render() {
        const filteredTasks = this.getFilteredTasks();

        // 更新统计
        this.updateStats();

        // 显示/隐藏空状态
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.classList.add('show');
            return;
        }

        this.emptyState.classList.remove('show');

        // 渲染任务
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox" data-action="toggle" data-id="${task.id}"></div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" data-action="delete" data-id="${task.id}">删除</button>
            </li>
        `).join('');
    }

    // HTML转义，防止XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TaskFlow();
});
