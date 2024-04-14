class DJ {

    async closePopup() {
        let popup = document.querySelector('.popup');
        popup.style.display = 'none';
        let ul = document.getElementById('songList');
        ul.innerHTML = '';
    }

    async removeSong(timeslotId, index) {
        await fetch(`/timeslots/${timeslotId}/psongs/${index}`, {
            method: 'PUT',
        });
        this.closePopup();
        this.openPopup(timeslotId);
    }

    async createSelect(id, songs, song, songIndex) {
        let select = document.createElement('select');
        songs.forEach(value => {
          let option = document.createElement('option');
          option.text = value.title;
          option.value = value.id; 
          option.selected = (value.id === song.id); 
          select.add(option);
        });
        select.addEventListener('change', async () => { 
            await fetch(`/timeslots/${id}/psongs/${songIndex}/${select.value}`, { method: 'PUT' });
            this.closePopup(); 
            this.openPopup(id); 
        });
        return select;
    }
    
    async openPopup(id) {
        let popup = document.querySelector('.popup');
        popup.style.display = 'block';
        let ul = document.getElementById('songList');
        ul.innerHTML = '';
        let closeButton = document.querySelector('.popup .closeButton');
        closeButton.addEventListener('click', this.closePopup);
        let response = await fetch(`/timeslots/${id}`);
        let data = await response.json();
        const timeslot = data.timeslot;
        response = await fetch(`/songs/${timeslot.psongs}`);
        data = await response.json();
        let psongs = data.songs;
        response = await fetch(`/songs`);
        data = await response.json();
        const songs = data.songs;
        if(!timeslot.psongs.length) {
            psongs = []; 
        }
        psongs.forEach(async (song, songIndex) => {
            let li = document.createElement('li');
            let select = await this.createSelect(id, songs, song, songIndex);
            li.appendChild(select);
            let removeButton = document.createElement('button');
            removeButton.innerText = 'Remove';
            removeButton.addEventListener('click', () => {
                this.removeSong(id, songIndex);
            });
            li.appendChild(removeButton);
            ul.appendChild(li);
        });
        const newSong = {
            _id: '-1',
            id: '000',
            title: 'add Song',
            duration: 0
        };
        data.songs.unshift(newSong);
        let li = document.createElement('li');
        let select = await this.createSelect(id, songs, songs[0], psongs.length);
        li.appendChild(select);
        ul.appendChild(li);
    }

    async timeSlot(pssn, dssn) {
        const response = await fetch(`/timeslots/${pssn}/${dssn}`); 
        const data = await response.json();
        const timeslots = data.timeslots;
        let column = document.getElementById("djColumn");
        column.innerHTML = timeslots.map((slot) => {
            return `<row class="rSlot">date: ${slot.date} start: ${slot.start} end: ${slot.end} <button class="editButton">Edit</button></row>`;
        }).join('');
        let editButtons = column.querySelectorAll('.editButton');
        editButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                this.openPopup(timeslots[index].id);
            });
        });
    }

    async selectDJ(pssn, dssn, selectedDJSlot) {
        document.querySelectorAll("#djList li").forEach(li => li.style.border = "2px solid black");
        selectedDJSlot.style.border = "1px solid green";
        this.timeSlot(pssn, dssn);
    }

    async initialize(pssn) {
        try {
            const response = await fetch(`/djs/${pssn}`); // Fetch DJs based on producer's SSN
            const data = await response.json();
            const djs = data.djs;

            let ul = document.getElementById("djList");
            if (ul && Array.isArray(djs)) {
                djs.forEach(dj => {
                    let li = document.createElement("li");
                    li.textContent = dj.name; // Assuming 'name' is the field in DJ model
                    li.addEventListener("click", () => {
                        this.selectDJ(pssn, dj.ssn, li); // Pass both producerSSN and DJ's SSN to selectDJ method
                    });
                    ul.appendChild(li);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const producerSSN = urlParams.get('ssn');
const dj = new DJ();
dj.initialize(producerSSN);
