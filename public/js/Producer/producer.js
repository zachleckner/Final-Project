class Producer {

    selectProducer(pssn) {
        window.location.href = `/Producer2?ssn=${encodeURIComponent(pssn)}`;
    }

    async initialize() {
        try {
            const response = await fetch('/producers'); 
            const data = await response.json();
            const producers = data.producers;

            let ul = document.getElementById("djList");
            if (ul && Array.isArray(producers)) {
                producers.forEach(producer => {
                    let li = document.createElement("li");
                    li.textContent = producer.name;
                    li.addEventListener("click", () => {
                        this.selectProducer(producer.ssn);
                    });
                    ul.appendChild(li);
                });
            }
        } catch (error) {
            console.error(error);
        }
    }
}

const producers = new Producer();
producers.initialize();