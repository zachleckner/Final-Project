document.addEventListener('DOMContentLoaded', () => {
    const manager = new Manager();
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const producerSSN = urlParams.get('ssn');

    manager.initialize(producerSSN);

    const timeSlotHeading = document.querySelector('.timeSlotHeading');
    if (timeSlotHeading) {
        const addTimeslotButton = document.createElement('button');
        addTimeslotButton.textContent = 'Add Time Slot';
        addTimeslotButton.addEventListener('click', function() {
            manager.showAddTimeslotForm(); // Use the stored SSN within the class
        });
        timeSlotHeading.appendChild(addTimeslotButton);
    } else {
        console.error('Time Slot Heading element not found.');
    }
});

class Manager {
    constructor() {
        this.dynamicList = document.getElementById("dynamicList");
        this.timeslotColumn = document.getElementById("timeSlotColumn");
        this.listHeading = document.getElementById("listHeading");
        this.selectedDJSSN = null;
        this.currentProducerSSN = null;
        this.addTimeslot = this.addTimeslot.bind(this);
        this.timeslots = [];
    }

    async initialize(producerSSN) {
        this.currentProducerSSN = producerSSN; // Set SSN initially or whenever it's available
        if (producerSSN) {
            await this.loadDJs(producerSSN);
        } else {
            await this.loadProducers();
        }
    }
    async addTimeslot(producerSSN, djSSN, newSlotData) {
        try {
            const response = await fetch('/addTimeslot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ producerSSN, djSSN, ...newSlotData }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Timeslot added successfully:', data.message);
                    this.loadTimeslots(producerSSN, djSSN);
                } else {
                    console.error('Failed to add timeslot:', data.message);
                }
            } else {
                const errorText = await response.text();
                console.error('Error adding timeslot:', errorText);
            }
        } catch (error) {
            console.error('Error adding timeslot:', error);
        }
    }

    async loadProducers() {
        try {
            const response = await fetch('/producers');
            const data = await response.json();
            this.displayItems(data.producers, 'Producer Select', this.loadDJs.bind(this), true);
        } catch (error) {
            console.error('Error loading producers:', error);
        }
    }

    async loadDJs(producerSSN) {
        try {
            const response = await fetch(`/djs/${producerSSN}`);
            const data = await response.json();
            this.displayItems(data.djs, 'DJ Select', this.handleDJSelection.bind(this), false);
        } catch (error) {
            console.error('Error loading DJs:', error);
        }
    }

    handleDJSelection(djSSN) {
        this.selectedDJSSN = djSSN;
        this.loadTimeslots(this.currentProducerSSN, djSSN);
    }

    async loadTimeslots(producerSSN, djSSN) {
        try {
            const response = await fetch(`/timeslots?producerSSN=${producerSSN}&djSSN=${djSSN}`);
            const data = await response.json();
            this.timeslots = data.timeslots;
            this.displayTimeslots();
        } catch (error) {
            console.error('Error loading timeslots:', error);
        }
    }

    displayItems(items, headingText, clickHandler, isProducer) {
        this.listHeading.textContent = headingText;
        this.dynamicList.innerHTML = ''; // Clear the list before adding new items
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.name;
            li.addEventListener("click", () => {
                clickHandler(item.ssn);
                if (isProducer) {
                    this.currentProducerSSN = item.ssn; // Update SSN when a producer is selected
                    window.history.pushState({ ssn: item.ssn }, '', `?ssn=${item.ssn}`);
                }
            });
            this.dynamicList.appendChild(li);
        });
    }

    displayTimeslots() {
        this.timeslotColumn.innerHTML = '';
        if (this.timeslots.length === 0) {
            this.timeslotColumn.textContent = 'No timeslots available';
            return;
        }
        const timeslotContainer = document.createElement("div");
        timeslotContainer.className = "timeslot-container";
        this.timeslots.forEach(slot => {
            const timeslotDiv = document.createElement("div");
            timeslotDiv.className = 'timeslot-entry';
            timeslotDiv.innerHTML = `
                <span>Date: ${slot.date}, Start: ${slot.start}, End: ${slot.end}</span>
                <button class="edit-button" data-id="${slot.id}">Edit</button>
            `;
            timeslotContainer.appendChild(timeslotDiv);
        });
        this.timeslotColumn.appendChild(timeslotContainer);
    
        // Add event listener to edit buttons
        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const timeslotId = button.getAttribute('data-id');
                this.showEditTimeslotForm(timeslotId);
            });
        });
    }

    showEditTimeslotForm(timeslotId) {
        // Find the timeslot by ID
        const timeslot = this.timeslots.find(slot => slot.id === timeslotId);
    
        const formOverlay = document.createElement('div');
        formOverlay.className = 'form-overlay';
        formOverlay.innerHTML = `
            <div class="form-container">
                <h2>Edit Timeslot</h2>
                <form id="editTimeslotForm">
                    <input type="hidden" id="timeslotId" value="${timeslot.id}">
                    <label for="date">Date:</label>
                    <input type="date" id="date" name="date" value="${timeslot.date}" required>
                    <label for="start">Start Time:</label>
                    <input type="text" id="start" name="start" value="${timeslot.start}" placeholder="HH:mm" pattern="^([01]\\d|2[0-3]):?([0-5]\\d)$" required>
                    <label for="end">End Time:</label>
                    <input type="text" id="end" name="end" value="${timeslot.end}" placeholder="HH:mm" pattern="^([01]\\d|2[0-3]):?([0-5]\\d)$" required>
                    <button type="submit">Save Changes</button>
                    <button type="button" id="cancelButton">Cancel</button>
                </form>
            </div>
        `;
        document.body.appendChild(formOverlay);
    
        const form = document.getElementById('editTimeslotForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const timeslotId = form.timeslotId.value;
            const date = form.date.value;
            const start = form.start.value;
            const end = form.end.value;
    
            await this.updateTimeslot(timeslotId, { date, start, end });
            document.body.removeChild(formOverlay);
        });
    
        document.getElementById('cancelButton').addEventListener('click', () => {
            document.body.removeChild(formOverlay);
        });
    }

    async updateTimeslot(timeslotId, updatedData) {
        console.log("Updating timeslot with ID:", timeslotId, "Data:", updatedData);
        try {
            const response = await fetch(`/updateTimeslot/${timeslotId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...updatedData,
                    producerSSN: this.currentProducerSSN,
                    djSSN: this.selectedDJSSN
                }),
            });
    
            const data = await response.json();
            if (data.success) {
                console.log('Timeslot updated successfully:', data.message);
                this.loadTimeslots(this.currentProducerSSN, this.selectedDJSSN);
            } else {
                console.error('Failed to update timeslot:', data.message);
            }
        } catch (error) {
            console.error('Error updating timeslot:', error);
        }
    }

    showAddTimeslotForm() {
        if (!this.currentProducerSSN) {
            console.error('Producer SSN is null, cannot show add timeslot form.');
            return; 
        }
        const formOverlay = document.createElement('div');
        formOverlay.className = 'form-overlay';
        formOverlay.innerHTML = `
            <div class="form-container">
                <h2>Add Timeslot</h2>
                <form id="addTimeslotForm">
                    <label for="date">Date:</label>
                    <input type="date" id="date" name="date" required>
                    <label for="start">Start Time:</label>
                    <input type="text" id="start" name="start" placeholder="HH:mm" pattern="^([01]\\d|2[0-3]):?([0-5]\\d)$" required>
                    <label for="end">End Time:</label>
                    <input type="text" id="end" name="end" placeholder="HH:mm" pattern="^([01]\\d|2[0-3]):?([0-5]\\d)$" required>
                    <button type="submit">Add Timeslot</button>
                    <button type="button" id="cancelButton">Cancel</button>
                </form>
            </div>
        `;
        document.body.appendChild(formOverlay);
    
        const form = document.getElementById('addTimeslotForm');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const date = form.date.value;
            const start = form.start.value;
            const end = form.end.value;
    
            await this.addTimeslot(this.currentProducerSSN, this.selectedDJSSN, { date, start, end });
            document.body.removeChild(formOverlay);
        });
    
        document.getElementById('cancelButton').addEventListener('click', () => {
            document.body.removeChild(formOverlay);
        });
    }
    
}
