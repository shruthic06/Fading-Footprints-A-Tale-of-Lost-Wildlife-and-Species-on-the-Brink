const width = 800;
const height = 800;
const sensitivity = 75;

let clicked; 
let currentPage = 0; 

const svg = d3.select("#globe");
const projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

const path = d3.geoPath().projection(projection);

initializeGlobe();

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json")
]).then(([world]) => {
    renderLand(world);
    addImages();
    addGraticule();
    globeRotation();
});

document.getElementById("closeBox").addEventListener("click", closeInfoBox);


function initializeGlobe() {
    const defs = svg.append("defs");
    
    const sunlight = defs.append("radialGradient")
    .attr("id", "sunlight")
    .attr("cx", "30%")
    .attr("cy", "30%")
    .attr("r", "50%");

sunlight.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgba(255, 255, 224, 0.4)"); 
sunlight.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgba(0, 0, 0, 0.2)"); 


    svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projection.scale())
    .attr("fill", "url(#sunlight)");


    const atmosphereGradient = defs.append("radialGradient")
    .attr("id", "atmosphere-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

atmosphereGradient.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", "rgba(135, 206, 250, 0.2)"); 
atmosphereGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgba(135, 206, 250, 0)"); 

svg.append("circle")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projection.scale() + 25) 
    .attr("fill", "url(#atmosphere-gradient)")
    .attr("opacity", 0.6);

    const oceanGradient = defs.append("radialGradient")
    .attr("id", "ocean-gradient")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

oceanGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#006994"); 
oceanGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#00334d"); 


    const landPattern = defs.append("pattern")
    .attr("id", "land-texture")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10);

landPattern.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "#2e8b57"); 

landPattern.append("path")
    .attr("d", "M0,0 L10,10 M10,0 L0,10")
    .attr("stroke", "rgba(0, 0, 0, 0.1)")
    .attr("stroke-width", 1);


    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", projection.scale())
        .attr("fill", "url(#ocean-gradient)");
}


function renderLand(world) {
    const land = topojson.feature(world, world.objects.land);

    svg.append("path")
        .datum(land)
        .attr("class", "land")
        .attr("d", path)
        .attr("fill", "url(#land-texture)")
        .attr("stroke", "#1b5e20")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.9);
}

function addImages() {
    const images = [
        { src: "images/tiger.png", label: "Tiger" },
        { src: "images/beluga.png", label: "Beluga Whale" },
        { src: "images/panda.png", label: "Panda" },
        { src: "images/crane.png", label: "Siberian Crane" },
        { src: "images/fox.png", label: "Arctic Fox" }
    ];

    const circleSpacing = 100;
    const imageSize = 135;
    svg.selectAll("image").remove();

    images.forEach((image, i) => {
        const angle = (i * 2 * Math.PI) / 5; 
        const x = width / 2 + (projection.scale() + circleSpacing) * Math.cos(angle);
        const y = height / 2 + (projection.scale() + circleSpacing) * Math.sin(angle);

        const img = svg.append("image")
            .attr("xlink:href", image.src)
            .attr("x", x - imageSize / 2) 
            .attr("y", y - imageSize / 2) 
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("cursor", "pointer")
            .attr("data-original-x", x - imageSize / 2) 
            .attr("data-original-y", y - imageSize / 2)
            .on("click", function () {
                clicked = image.label;

                
                d3.select(this)
                    .transition()
                    .duration(1000)
                    .attr("x", 50) 
                    .attr("y", height / 2 - imageSize) 
                    .attr("width", imageSize * 2) 
                    .attr("height", imageSize * 2) 
                    .on("end", () => {
                        
                        const infoBox = document.getElementById("infoBox");
                        infoBox.style.display = "flex"; 
                        infoBox.classList.add("show"); 

                        
                        displayImageBox(image.label, image.src);
                        initializeNavigation();
                        displayPage(0);
                    });
            });
    });
}


function addGraticule() {
    const graticule = d3.geoGraticule();
    svg.append("path")
        .datum(graticule())
        .attr("class", "graticule")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.3)") 
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2, 2"); 
}


function globeRotation() {
    let rotation = 0;
    let dragging = false;
    let previousMousePosition = null;

    svg.call(d3.drag()
        .on("start", (event) => {
            dragging = true;
            previousMousePosition = { x: event.x, y: event.y };
        })
        .on("drag", (event) => {
            if (!dragging) return;

            const dx = event.x - previousMousePosition.x;
            const dy = event.y - previousMousePosition.y;

            projection.rotate([
                rotation + dx / sensitivity,
                -dy / sensitivity
            ]);

            svg.selectAll("path")
                .attr("d", path);

            previousMousePosition = { x: event.x, y: event.y };
        })
        .on("end", () => {
            dragging = false;
            rotation = projection.rotate()[0];
        }));

        function autoRotate() {
            rotation += 0.2; 
            projection.rotate([rotation, -15]);
            svg.selectAll("path").attr("d", path); 
            requestAnimationFrame(autoRotate); 
        }
        

    autoRotate();
}

function renderChoroplethMap(animal) {
    const infoBox = document.getElementById("infoBox");

    const description = document.querySelector(".text-column p");
    const title = document.querySelector(".text-column h1");
    title.innerHTML = "<h1>Global distribution</h1>"
    if(animal == 'Tiger') {
        infoBox.style.backgroundImage = "linear-gradient(to bottom right, white,#d5d57e,#d4d280)";
       description.innerHTML =  "This map highlights the distribution of tigers, primarily across Asia (shaded in blue). Tigers inhabit forests, grasslands, and wetlands in countries like India, Russia, China, and parts of Southeast Asia. This range underscores the need for conservation efforts to protect their habitats and combat threats like poaching and habitat fragmentation."
    }
    if(animal == 'Beluga Whale') {
        infoBox.style.backgroundImage = "linear-gradient(135deg, #ffffff, #e0f7fa, #b3e5fc, #81d4fa, #b0bec5)";
        description.innerHTML =  "This map highlights the distribution of the Beluga Whale, found primarily in Arctic and sub-Arctic regions. Key habitats include the coastal waters of Canada, Alaska, Iceland, Norway, and Russia. Belugas prefer shallow coastal areas but may migrate to deeper waters during winter, reflecting their adaptation to cold, ice-filled environments."
    }
    if(animal == 'Siberian Crane') {
        infoBox.style.backgroundImage = "inear-gradient(135deg, #ffffff, #d1e9f2, #a3c9e2, #50697e, #000000)";
        description.innerHTML =  "This map illustrates the Siberian Crane's distribution range, spanning Siberia, China, India, and Iran, showcasing their breeding, migration, and wintering areas. Breeding occurs in the Arctic tundra of Siberia, while the eastern population winters in China's Poyang Lake, and the western population historically wintered in India's Bharatpur and Iran."
    }
    if(animal == 'Panda') {
        infoBox.style.backgroundImage = "linear-gradient(135deg, #ffffff, #d9d9d9, #595959, #000000)";
        description.innerHTML = "This map shows the distribution of the giant panda, which is native to China. Pandas primarily inhabit mountainous regions in Sichuan, Shaanxi, and Gansu, where they thrive in bamboo forests. This limited range emphasizes the importance of habitat conservation efforts in China to ensure the survival of this iconic species."
    }
    if(animal == 'Arctic Fox') {
        infoBox.style.backgroundImage = "linear-gradient(135deg, #ffffff, #e0f7fa, #cfd8dc, #90a4ae, #546e7a)";
        description.innerHTML = "This map highlights the distribution of the Arctic fox, spanning the Arctic and sub-Arctic regions. Their range includes the tundra areas of North America, Greenland, Russia, and Scandinavia, where they thrive in cold climates. This widespread distribution reflects their adaptation to extreme Arctic conditions."
    }
    const box = document.querySelector(".text-column .content");
    box.innerHTML = ""; 

    const width = 600;
    const height = 400;

    const svg = d3.select(box)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("padding", "10px")
        .style("font-size", "12px")
        .style("box-shadow", "0px 4px 6px rgba(0, 0, 0, 0.1)")
        .style("visibility", "hidden");

    
    Promise.all([
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
        d3.json("data/cleaned_species_distribution.geojson")
    ]).then(([worldData, speciesData]) => {
        
        const countries = topojson.feature(worldData, worldData.objects.countries);
        const filteredSpecies = speciesData.features.filter(
            d => d.properties.Species === animal
        );

        const highlightedCountries = new Set(filteredSpecies.map(d => d.properties.Country));
        const projection = d3.geoNaturalEarth1().fitSize([width, height], countries);
        const path = d3.geoPath().projection(projection);
        svg.append("g")
            .selectAll("path")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => highlightedCountries.has(d.properties.name) ? "#42a5f5" : "#e0e0e0")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("class", d => highlightedCountries.has(d.properties.name) ? "highlighted" : "")
            .on("mouseover", (event, d) => {
                if (highlightedCountries.has(d.properties.name)) {
                    d3.select(event.target)
                        .attr("stroke", "#000000") 
                        .attr("stroke-width", 2); 
                    tooltip.style("visibility", "visible")
                        .html(`
                            <strong>Country:</strong> ${d.properties.name}<br>
                            <strong>Species:</strong> ${animal}
                        `);
                }
            })
            .on("mousemove", (event) => {
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", (event, d) => {
                if (highlightedCountries.has(d.properties.name)) {
                    d3.select(event.target)
                        .attr("stroke", "#ffffff") 
                        .attr("stroke-width", 0.5);

                    tooltip.style("visibility", "hidden");
                }
            });

        
    });
}



function renderPieChart(animal) {
    const description = document.querySelector(".text-column p");
    const title = document.querySelector(".text-column h1");
    title.innerHTML = "<h1>Threats to Survival</h1>"
    if(animal == 'Tiger') {
       description.innerHTML =  "This chart highlights the primary threats to tigers, with habitat loss contributing 50% and poaching 40% of the total threats. Minor factors include climate change and human-wildlife conflict at 5% each. These findings stress the urgent need for habitat conservation and anti-poaching measures to ensure the survival of tiger populations"}
    if(animal == 'Beluga Whale') {
        description.innerHTML =  "This donut chart illustrates the key threats faced by the Beluga Whale. Climate change and pollution are the most significant factors, each contributing 30% to the threats, while habitat loss and other factors contribute 20% each. These issues highlight the urgent need for conservation efforts to address environmental changes, pollution, and habitat preservation to protect beluga populations."}
     if(animal == 'Siberian Crane') {
        description.innerHTML =  "The chart highlights key threats to the Siberian Crane, with habitat loss being the most significant (70%), driven by wetland destruction and agricultural expansion. Poaching, climate change, and other factors each contribute 10% to the threats. Conservation efforts must prioritize wetland restoration to ensure the species' survival."}
     if(animal == 'Panda') {
        description.innerHTML = "This chart highlights the threats to pandas, with habitat loss being the dominant factor, contributing 80% to their endangerment. Other threats include poaching (10%), climate change (5%), and human-wildlife conflict (5%). These findings stress the need for habitat preservation to ensure the survival of pandas."}
     if(animal == 'Arctic Fox') {
        description.innerHTML = "This chart highlights the major threats to the Arctic fox, with climate change being the most significant factor (50%), followed by habitat loss (30%) and other factors (20%). Climate change impacts the Arctic ecosystem, reducing prey availability and increasing competition with species like red foxes, emphasizing the need for conservation and climate action."}
   
    const box = document.querySelector(".text-column .content");
    box.innerHTML = ""; 
    
   
    const width = 700;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(box)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);
        d3.csv("data/reasons_of_endangerment.csv").then(data => {
            const row = data.find(d => d.Species === animal);
            if (row) {
                const categories = [
                    { category: "Habitat Loss", value: +row["Habitat Loss (%)"] },
                    { category: "Poaching", value: +row["Poaching (%)"] },
                    { category: "Climate Change", value: +row["Climate Change (%)"] },
                    { category: "Pollution", value: +row["Pollution (%)"] },
                    { category: "Human-Wildlife Conflict", value: +row["Human-Wildlife Conflict (%)"] },
                    { category: "Other", value: +row["Other (%)"] }
                ].filter(d => d.value > 0); 
        
                const pie = d3.pie().value(d => d.value);
                const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);
                const color = d3.scaleOrdinal(d3.schemeCategory10);
        
                svg.selectAll('path')
                    .data(pie(categories))
                    .enter()
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', d => color(d.data.category))
                    .style("stroke", "white")
                    .style("stroke-width", "2px");
        
                svg.selectAll('text')
                    .data(pie(categories))
                    .enter()
                    .append('text')
                    .text(d => `${Math.round(d.data.value)}%`)
                    .attr("transform", d => `translate(${arc.centroid(d)})`)
                    .style("text-anchor", "middle")
                    .style("font-size", "12px");
        
                
                const legend = svg.append("g")
                    .attr("transform", `translate(${-width / 2 +580}, ${-height / 2 + 10})`);
        
                categories.forEach((d, i) => {
                    const legendRow = legend.append("g")
                        .attr("transform", `translate(0, ${i * 20})`);
        
                    legendRow.append("rect")
                        .attr("width", 12)
                        .attr("height", 12)
                        .attr("fill", color(d.category));
        
                    legendRow.append("text")
                        .attr("x", 20)
                        .attr("y", 10)
                        .attr("text-anchor", "start")
                        .style("font-size", "12px")
                        .text(d.category);
                });
            }
        }).catch(error => console.error("Error loading CSV:", error));
        
    
    }



function renderLineChart(animal) {
    const description = document.querySelector(".text-column p");
    const title = document.querySelector(".text-column h1");
    title.innerHTML = "<h1>Population Trend</h1>"
    if(animal == 'Tiger') {
       description.innerHTML =  "This line graph illustrates the tiger population trend from 1980 to 2020. Starting at approximately 4,000 in 1980, the population declined sharply, reaching its lowest point around 2000. However, conservation efforts led to a gradual recovery, with the population stabilizing near 3,900 by 2020. This reflects the impact of global initiatives to protect tigers and their habitats.";
    }
    if(animal == 'Beluga Whale') {
        description.innerHTML =  "This line graph shows the decline in the Beluga Whale population from 1980 to 2020. Starting at around 180,000 in 1980, the population steadily decreased, reaching approximately 100,000 by 2020. The decline reflects growing threats like climate change, pollution, and habitat loss, emphasizing the urgent need for conservation measures to protect the species."}
     if(animal == 'Siberian Crane') {
        description.innerHTML =  "This line graph illustrates the gradual increase in the Siberian Crane population from 1980 to 2020. Starting at approximately 2,500 individuals in 1980, the population steadily grew, reaching over 4,000 by 2020. This trend reflects ongoing conservation efforts, though the species remains critically endangered."}
     if(animal == 'Panda') {
        description.innerHTML = "This line graph illustrates the growth of the giant panda population from 1980 to 2020. Starting at approximately 1,000 individuals in 1980, the population has steadily increased, surpassing 2,000 by 2020. This positive trend reflects the success of conservation programs, including habitat protection and captive breeding, though continued efforts are crucial for sustaining the species."}
     if(animal == 'Arctic Fox') {
        description.innerHTML = "This line graph illustrates the decline in the Arctic fox population from 1980 to 2020. Starting at  around 260,000 in 1980, the population steadily decreased, dropping below 100,000 by 2020. This sharp decline highlights the impact of climate change, habitat loss, and competition from red foxes        on the survival of Arctic foxes, emphasizing the urgency for conservation efforts."
    }
    const box = document.querySelector(".text-column .content");
    box.innerHTML = ""; 

    const margin = { top: 20, right: 50, bottom: 40, left: 60 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(box)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    Promise.all([
        d3.csv("data/endangered_species_population.csv"),
        d3.csv("data/endangered_status_data.csv")
    ]).then(([populationData, statusData]) => {
        const filteredData = populationData.map(d => ({
            year: +d.Year,
            population: +d[animal],
            species: d.Species
        })).filter(d => d.population);

        const statusMap = statusData.reduce((acc, d) => {
            acc[+d.Year] = d[animal] || "Unknown";
            return acc;
        }, {});

        const x = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.year))
            .range([10, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d.population) * 1.1])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.population))
            .curve(d3.curveMonotoneX);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("transform", `translate(10,${height-340})`)
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        const tooltip = d3.select(box)
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden");

        svg.selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.population))
            .attr("r", 5)
            .attr("fill", d => statusMap[d.year] === "Endangered" ? "red" : "green")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .html(`
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Population:</strong> ${d.population}<br>
                        
                    `);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY - 50}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom)
            .attr("text-anchor", "middle")
            .text("Year");

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", height -385)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Population");

    
    }).catch(error => console.error("Error loading data:", error));
}


function displayImageBox(label, imageSrc) {
    const box = document.getElementById("infoBox");
    if (!box) {
        console.error("InfoBox not found in the DOM.");
        return;
    }

    box.style.display = "flex";
    box.classList.add("show");

    const leftImage = document.querySelector(".image-column img");
    const leftImageTitle = document.querySelector(".image-column h1");
    const title = document.querySelector(".text-column h1");
    const description = document.querySelector(".text-column p");

    if (!leftImage || !title || !description) {
        console.error("One or more elements inside the InfoBox are missing.");
        return;
    }

    leftImageTitle.textContent = label;
    leftImage.src = imageSrc;
    leftImage.style.width = "100%"; 
    leftImage.style.height = "auto"; 

}



function closeInfoBox() {
    const box = document.getElementById("infoBox");
    box.style.display = "none"; 
    box.classList.remove("show"); 


    svg.selectAll("image")
        .transition()
        .duration(1000)
        .attr("x", function () {
            return d3.select(this).attr("data-original-x");
        })
        .attr("y", function () {
            return d3.select(this).attr("data-original-y");
        })
        .attr("width",  140) 
        .attr("height", 140); 
}


function displayPage(pageIndex) {
    const box = document.querySelector(".text-column .content");
    box.innerHTML = ""; 

    if (pageIndex === 0) {
        renderChoroplethMap(clicked);
    } else if (pageIndex === 1) {
        renderPieChart(clicked);
    } else if (pageIndex === 2) {
        renderLineChart(clicked);
    }

    toggleNavigationButtons();
}

function initializeNavigation() {
    document.getElementById("backArrow").addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    document.getElementById("nextArrow").addEventListener("click", () => {
        if (currentPage < 2) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    displayPage(currentPage);
    toggleNavigationButtons(); 
}

function initializeNavigation() {
    currentPage = 0;

   
    displayPage(currentPage);

   
    document.getElementById("backArrow").onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            displayPage(currentPage);
        }
    };

    document.getElementById("nextArrow").onclick = () => {
        if (currentPage < 2) {
            currentPage++;
            displayPage(currentPage);
        }
    };

    toggleNavigationButtons();
}

function toggleNavigationButtons() {
    const backArrow = document.getElementById("backArrow");
    const nextArrow = document.getElementById("nextArrow");
    backArrow.disabled = currentPage === 0;
    nextArrow.disabled = currentPage === 2;
}

function displayPage(pageIndex) {
    const box = document.querySelector(".text-column .content");
    box.innerHTML = ""; 

    if (pageIndex === 0) {
    
        renderChoroplethMap(clicked);
    } else if (pageIndex === 1) {
        
        renderPieChart(clicked);
    } else if (pageIndex === 2) {
       
        renderLineChart(clicked);
    }

    toggleNavigationButtons();
}

var main = document.querySelector("body");
      var scrolly = main.querySelector("#scrolly");
      var sticky = scrolly.querySelector(".sticky-thing");
      var article = scrolly.querySelector("article");
      var steps = article.querySelectorAll(".step");

    
      var scroller = scrollama();

     
      function handleStepEnter(response) {
      
        var el = response.element;

        
      }

      function handleStepProgress(response) {
       
        var el = response.element;

       
        if (response.index === 0) {
          
          var parakeetImage = document.querySelector('.parakeet-left');

          
          const opacity = 1 - (response.progress * response.progress); 
          parakeetImage.style.opacity = opacity;
        }

        if (response.index === 1) {
         
          var pyreneanIbex = document.querySelector('.pyrenean-ibex');
      
          
          const opacity = 1 - response.progress; 
          pyreneanIbex.style.opacity = opacity;
        }

        if (response.index === 2) {
          
          var vaquita = document.querySelector('.vaquita');
      
          
          const opacity = 1 - (2*response.progress); 
          vaquita.style.opacity = opacity;
        }

        if (response.index === 3) {
         
          var rhino = document.querySelector('.rhino');
      
          const opacity = 1 - (response.progress * response.progress); 
          rhino.style.opacity = opacity;
        }

        if (response.index === 4) {
         
          var acalypha = document.querySelector('.acalypha');
      
          
          const opacity = 1 - (response.progress); 
          acalypha.style.opacity = opacity;
        }
      }

      function init() {
        scroller
          .setup({
            step: "#scrolly article .step",
            offset: 0.85,
            progress: true,
            debug: false
          })
          .onStepEnter(handleStepEnter)
          .onStepProgress(handleStepProgress); 


       
        window.addEventListener("resize", scroller.resize);
      }

      
      init();

      const width1 = document.getElementById("visualization").clientWidth;
      const height1 = document.getElementById("visualization").clientHeight;
      const margin = { top: 80, right: 60, bottom: 80, left: 100 };
      
     
      const svg1 = d3.select("#visualization")
          .append("svg")
          .attr("width", width1)
          .attr("height", height1);      
     
      let currentData = 0; 
      const datasets = [
          "data/conservation_summary.csv", 
          "data/difference_conservation_summary.csv"       
      ];
      
     
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      const circleColor = "gold";
      
      const xScale = d3.scaleBand().range([margin.left, width1 - margin.right]).padding(0.2);
      const yScale = d3.scaleLinear().range([height1 - margin.bottom, margin.top]);
      const circleScale = d3.scaleSqrt().range([5, 30]);
      const petalLengthScale = d3.scaleLinear().range([5, 50]);
      
      
      loadAndRender(datasets[currentData]);
      
      
      function loadAndRender(dataPath) {
          d3.csv(dataPath).then(data => {
              
              data.forEach(d => {
                  d.Year = +d.Year;
                  d.Total_Assessed = +d.Total_Assessed;
                  d.Total_Vulnerable = +d.Total_Vulnerable;
                  d.Vertebrates_Assessed = +d.Vertebrates_Assessed;
                  d.Vertebrates_Vulnerable = +d.Vertebrates_Vulnerable;
                  d.Invertebrates_Assessed = +d.Invertebrates_Assessed;
                  d.Invertebrates_Vulnerable = +d.Invertebrates_Vulnerable;
                  d.Plants_Assessed = +d.Plants_Assessed;
                  d.Plants_Vulnerable = +d.Plants_Vulnerable;
                  d.Fungi_Assessed = +d.Fungi_Assessed;
                  d.Fungi_Vulnerable = +d.Fungi_Vulnerable;
              });
      
             
              xScale.domain(data.map(d => d.Year));
              yScale.domain([0, d3.max(data, d => d.Total_Assessed)]);
              circleScale.domain([0, d3.max(data, d => d.Total_Assessed)]);
              petalLengthScale.domain([0, d3.max(data, d => Math.max(d.Vertebrates_Vulnerable, d.Invertebrates_Vulnerable, d.Plants_Vulnerable, d.Fungi_Vulnerable))]);
      
              
              svg1.selectAll("*").remove();
      
             
              svg1.append("g")
                  .attr("transform", `translate(0, ${height1 - margin.bottom})`)
                  .call(d3.axisBottom(xScale));
      
             
              svg1.append("text")
                  .attr("text-anchor", "middle")
                  .attr("x", (margin.left + width1 - margin.right) / 2)
                  .attr("y", height1 - margin.bottom / 2 + 30)
                  .text("Year")
                  .style("font-size", "14px");
      
             
              svg1.append("g")
                  .attr("transform", `translate(${margin.left}, 0)`)
                  .call(d3.axisLeft(yScale).ticks(6));
      
             
              svg1.append("text")
                  .attr("text-anchor", "middle")
                  .attr("transform", "rotate(-90)")
                  .attr("x", -(margin.top + height1 - margin.bottom) / 2)
                  .attr("y", margin.left / 3 - 20)
                  .text("Total Assessed")
                  .style("font-size", "14px");
      
             
              function drawFlower(g, data) {
                  const categories = [
                      { key: 'Vertebrates', assessed: 'Vertebrates_Assessed', vulnerable: 'Vertebrates_Vulnerable' },
                      { key: 'Invertebrates', assessed: 'Invertebrates_Assessed', vulnerable: 'Invertebrates_Vulnerable' },
                      { key: 'Plants', assessed: 'Plants_Assessed', vulnerable: 'Plants_Vulnerable' },
                      { key: 'Fungi', assessed: 'Fungi_Assessed', vulnerable: 'Fungi_Vulnerable' }
                  ];
                  const petalAngles = d3.range(0, 2 * Math.PI, (2 * Math.PI) / categories.length);
      
                  const circleRadius = circleScale(data.Total_Assessed);
      
                  categories.forEach((cat, i) => {
                      const startAngle = petalAngles[i];
                      const endAngle = petalAngles[i] + Math.PI / 3;
      
                      const arcGenerator = d3.arc()
                          .innerRadius(circleRadius * 0.8)
                          .outerRadius(circleRadius + petalLengthScale(data[cat.vulnerable]))
                          .startAngle(startAngle)
                          .endAngle(endAngle)
                          .cornerRadius(5);
      
                      g.append("path")
                          .attr("d", arcGenerator())
                          .attr("fill", colorScale(cat.key))
                          .on("mouseover", (event) => {
                              d3.select("#tooltip1")
                                  .style("visibility", "visible")
                                  .html(`
                                      <b>${cat.key}</b><br>
                                      Assessed: ${data[cat.assessed]}<br>
                                      Vulnerable: ${data[cat.vulnerable]}
                                  `);
                          })
                          .on("mousemove", (event) => {
                              d3.select("#tooltip1")
                                  .style("top", `${event.pageY - 10}px`)
                                  .style("left", `${event.pageX + 10}px`);
                          })
                          .on("mouseout", () => {
                              d3.select("#tooltip1").style("visibility", "hidden");
                          });
                  });
      
                  g.append("circle")
                      .attr("r", circleRadius)
                      .attr("fill", circleColor)
                      .attr("stroke", "black")
                      .attr("stroke-width", 1)
                      .on("mouseover", (event) => {
                          d3.select("#tooltip1")
                              .style("visibility", "visible")
                              .html(`
                                  <b>Total</b><br>
                                  Assessed: ${data.Total_Assessed}<br>
                                  Vulnerable: ${data.Total_Vulnerable}
                              `);
                      })
                      .on("mousemove", (event) => {
                          d3.select("#tooltip1")
                              .style("top", `${event.pageY - 10}px`)
                              .style("left", `${event.pageX + 10}px`);
                      })
                      .on("mouseout", () => {
                          d3.select("#tooltip1").style("visibility", "hidden");
                      });
              }
      
             
              data.forEach(d => {
                  const flowerX = xScale(d.Year) + xScale.bandwidth() / 2;
                  const flowerY = yScale(d.Total_Assessed);
      
                  const flowerGroup = svg1.append("g")
                      .attr("transform", `translate(${flowerX}, ${flowerY})`);
      
                  drawFlower(flowerGroup, d);
              });
          }).catch(error => {
              console.error("Error loading the CSV file:", error);
          });
      }
      
      
      document.getElementById("updateChart").addEventListener("click", () => {
          currentData = (currentData + 1) % datasets.length; 
          loadAndRender(datasets[currentData]);
          const state_now = document.getElementById("updateChart");
          if(state_now.value ==  "0") {
            state_now.innerHTML="Show Total";
            state_now.value = 1;
          } else {
            state_now.innerHTML="Difference by Year";
          }
      });


const wolfImage = document.getElementById("wolf-image");
const stepSections = document.querySelectorAll(".section");

const wolfStartPosition = 20; 
const wolfEndPosition = window.innerWidth - wolfImage.offsetWidth - 20; 

const totalScrollRange = stepSections[stepSections.length - 1].offsetTop - stepSections[0].offsetTop;

function updateWolfPosition() {
  const scrollPosition = Math.max(
    0,
    Math.min(totalScrollRange, window.scrollY - stepSections[0].offsetTop)
  );

  const progress = scrollPosition / totalScrollRange;
  const wolfPosition = wolfStartPosition + progress * (wolfEndPosition - wolfStartPosition);

  wolfImage.style.transform = `translateX(${wolfPosition}px)`;

  const extinctionText = document.querySelector("#step3 p");
  if (extinctionText.getBoundingClientRect().top < window.innerHeight / 2) {
    wolfImage.src = "/svg/grey_wolf_face_extinct.svg";
  } else {
    wolfImage.src = "/svg/grey_wolf_face.svg";
  }
}

window.addEventListener("scroll", updateWolfPosition);

updateWolfPosition();

const animatedElements = document.querySelectorAll(".hidden");
const dots = document.querySelectorAll(".dots button");

const tooltips = document.querySelectorAll(".tooltip");

tooltips.forEach((tooltip) => {
  tooltip.addEventListener("click", () => {
    tooltip.classList.toggle("active");

    tooltips.forEach((other) => {
      if (other !== tooltip) {
        other.classList.remove("active");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!tooltip.contains(e.target)) {
      tooltip.classList.remove("active");
    }
  });
});

function handleScrollAnimations() {
  const windowHeight = window.innerHeight;

  animatedElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= windowHeight) {
      element.classList.add("visible");
    } else {
      element.classList.remove("visible");
    }
  });

  dots.forEach((dot) => {
    const target = document.querySelector(dot.dataset.target);
    const rect = target.getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= windowHeight / 2) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", handleScrollAnimations);


const timelineData = [
  { year: "1900s", text: "Near extinction of wolves due to hunting" },
  { year: "1970s", text: "Protection under the Endangered Species Act" },
  { year: "1995", text: "First group of wolves reintroduced to Yellowstone" },
  { year: "2000s", text: "Evidence of ecological recovery" },
];


function createTimeline() {
  const timelineWidth = 800;
  const timelineHeight = 100;
  const padding = 50;

  const svg = d3.select("#timeline")
  .attr("width", 800)
  .attr("height", 200)
  .append("g")
  .attr("transform", "translate(300, 50)");


  const xScale = d3
    .scalePoint()
    .domain(timelineData.map((d) => d.year))
    .range([padding, timelineWidth - padding]);

  svg.append("line")
    .attr("class", "timeline-line")
    .attr("x1", padding)
    .attr("x2", timelineWidth - padding)
    .attr("y1", timelineHeight / 2)
    .attr("y2", timelineHeight / 2)
    .attr("stroke", "#ccc");

  svg.selectAll(".timeline-event")
    .data(timelineData)
    .enter()
    .append("circle")
    .attr("class", "timeline-event")
    .attr("cx", (d) => xScale(d.year))
    .attr("cy", timelineHeight / 2)
    .attr("r", 10);

  svg.selectAll(".timeline-text")
    .data(timelineData)
    .enter()
    .append("text")
    .attr("class", "timeline-text")
    .attr("x", (d) => xScale(d.year))
    .attr("y", timelineHeight / 2 - 50) 
    .text((d) => d.text)
    .call(wrap, 100); 

  svg.selectAll(".timeline-date")
    .data(timelineData)
    .enter()
    .append("text")
    .attr("class", "timeline-date")
    .attr("x", (d) => xScale(d.year))
    .attr("y", timelineHeight / 2 + 30)
    .text((d) => d.year);

  function wrap(text, width) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.1; // ems
      const y = text.attr("y");
      const dy = 0;
      let tspan = text
        .text(null)
        .append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", dy + "em");
      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text
            .append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", createTimeline);