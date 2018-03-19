// 831e7bdec6900fcd456fd38ddb8ba34d API key  -- Petfinder
// AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA   -- Google Maps JS API

//DOM VALUES

let renderDiv = document.querySelector(".results");
let breedInput = document.getElementById("pet-search");
let previousButton = document.getElementById("previous");
let nextButton = document.getElementById("next");
let pageNumberDiv = document.getElementById("pageNum");
//VALUES

let breedInfo;
let yieldedAdresses = [];
let refinedAddresses = [];
let addressGeoCode = [];
let trackOffset = "0";
let breedName = ``;
let postalCode = ``;
let totalNumberOfQualifiedDogs = ``;
let searchedDogsBreeds = [];
//Breed Suggestions
let allBreedsArray = [];
new Awesomplete(breedInput, {
  list: allBreedsArray
});

//FUNCTIONS//

function getAddresses(data) {
  let address = data.petfinder.pets.pet;
  address.map(pet => {
    yieldedAdresses.push({
      address: pet.contact.address1,
      city: pet.contact.city,
      state: pet.contact.state,
      zip: pet.contact.zip,
      email: pet.contact.email,
      phone: pet.contact.phone
    });
  });
}

function refineAddresses() {
  yieldedAdresses.map(result => {
    if (result.address.$t == null) {
      refinedAddresses.push({
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t,
        email: result.email.$t,
        phone: result.phone.$t
      });
    } else {
      refinedAddresses.push({
        address: result.address.$t,
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t,
        email: result.email.$t,
        phone: result.phone.$t
      });
    }
  });
}

function getAllBreeds() {
  $.ajax({
    url: `http://api.petfinder.com/breed.list?key=831e7bdec6900fcd456fd38ddb8ba34d&animal=dog&format=json&callback=?`,
    type: `GET`,
    dataType: `json`,
    success: function(response) {
      response.petfinder.breeds.breed.map(dogs => allBreedsArray.push(dogs.$t));
      return allBreedsArray;
    }
  });
}

function addressLoaded(geoCode) {
  try {
    addressGeoCode.push(geoCode.results[0].geometry.location);
    tryShowMap();
  } catch (error) {
    console.log(`Could not load and display one of the addresses`);
  }
}

function geoCodeAddress() {
  for (let i = 0; i < yieldedAdresses.length; i++) {
    if (refinedAddresses[i].address === undefined) {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${
          refinedAddresses[i].city
        } ${refinedAddresses[i].state} ${refinedAddresses[i].zip}`,
        type: "GET",
        dataType: "json"
      }).done(addressLoaded);
    } else {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${
          refinedAddresses[i].address
        } ${refinedAddresses[i].city} ${refinedAddresses[i].state} ${
          refinedAddresses[i].zip
        }`,
        type: "GET",
        dataType: "json"
      }).done(addressLoaded);
    }
  }
}

function renderPets(data) {
  let renderDivHtml = ``;
  let pets = data.petfinder.pets.pet;
  for (let i = 0; i < pets.length; i++) {
    try {
      // PHOTO
      if (Object.keys(data.petfinder.pets.pet[i].media).length == 0) {
        renderDivHtml += `
        <img src="assets/img/dog-sil.png" alt="Dog Photo">`;
      } else {
        renderDivHtml += `
        <img src="${
          pets[i].media.photos.photo[2].$t
        }" alt="Dog Photo" class='dog-photo'>`;
      }
      renderDivHtml += `<ul class="dog-result">`;
      // Start of the list
      if (Object.keys(data.petfinder.pets.pet[i].name).length == 0) {
        renderDivHtml += `<li>Name is not availiable</li>`;
      } else {
        renderDivHtml += `
          <li>${pets[i].name.$t}</li>`;
      }
      if (Object.keys(data.petfinder.pets.pet[i].breeds.breed).length == 0) {
        renderDivHtml += `<li>Lovely Mutt</li>`;
      } else if (Array.isArray(data.petfinder.pets.pet[i].breeds.breed)) {
        renderDivHtml += `
        <li class="${pets[i].breeds.breed[0].$t}">Primary Breed: ${
          pets[i].breeds.breed[0].$t
        }</li>`;
      } else if (typeof data.petfinder.pets.pet[i].breeds.breed == `object`) {
        renderDivHtml += `
          <li class="${pets[i].breeds.breed.$t}">Primary Breed: ${
          pets[i].breeds.breed.$t
        }</li>`;
      }
      if (Object.keys(data.petfinder.pets.pet[i].sex).length == 0) {
        renderDivHtml += `<li>Gender not confirmed</li>`;
      } else {
        renderDivHtml += `
          <li>Gender: ${pets[i].sex.$t}</li>`;
      }
      if (Object.keys(data.petfinder.pets.pet[i].age).length == 0) {
        renderDivHtml += `<li>Pets age is not availiable</li>`;
      } else {
        renderDivHtml += `<li>Age: ${pets[i].age.$t}</li>`;
      }

      if (Object.keys(data.petfinder.pets.pet[i].description).length == 0) {
        renderDivHtml += `<li>Description is not availiable</li>`;
      } else {
        renderDivHtml += `
          <li>${pets[i].description.$t}</li>`;
      }
      if (refinedAddresses[i].address == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<li>Address: ${refinedAddresses[i].address} `;
      }
      if (refinedAddresses[i].city == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `City: ${refinedAddresses[i].city} `;
      }
      if (refinedAddresses[i].state == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `State: ${refinedAddresses[i].state} `;
      }
      if (refinedAddresses[i].zip == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `Postal Code: ${refinedAddresses[i].zip} `;
      }
      if (refinedAddresses[i].email == null) {
        renderDivHtml += ` `;
      } else {
        `Email: ${refinedAddresses[i].email} `;
      }
      if (refinedAddresses[i].phone == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `Phone: ${refinedAddresses[i].phone} `;
      }
      renderDivHtml += `</li>`;
      renderDivHtml += `</ul>`;
      renderDivHtml += `<button class="wiki-button">Learn More About Breed</button>`;
      renderDivHtml += `<div class="wiki-result"></div>`;
    } catch (error) {
      console.log(error);
      renderDivHtml += `<h2>There was an error rendering these dogs</h2>`;
    }
  }

  renderDiv.innerHTML = renderDivHtml;
}

function initMap() {
  tryShowMap();
}
function tryShowMap() {
  if (typeof google == `undefined`) {
    // console.log(`goog is not ready aborting`);
    return;
  }
  if (addressGeoCode.length === 0) {
    //console.log(`addresses is not ready aborting`);
    return;
  }
  // console.log(`we are ready lets hsow it`);
  showMap();
}

function showMap() {
  let location;

  let options = {
    zoom: 5,
    center: addressGeoCode[0]
  };
  let map = new google.maps.Map(document.getElementById("map"), options);

  function addMarker(coords) {
    let marker = new google.maps.Marker({
      position: coords,
      map: map
    });
  }
  for (let i = 0; i < 5; i++) {
    location = addressGeoCode[i];
    addMarker(location);
  }
}

function renderNumberOfPages() {
  pageNumberDiv.innerHTML = `<h3> Page ${parseInt(trackOffset) / 5 +
    1}/${Math.floor(totalNumberOfQualifiedDogs / 5)}</h3>`;
}
function retreiveBreed(data) {
  for (let i = 0; i < yieldedAdresses.length; i++) {
    if (data.petfinder.pets.pet[i].breeds.breed.length > 0) {
      searchedDogsBreeds.push(data.petfinder.pets.pet[i].breeds.breed[0].$t);
    } else {
      searchedDogsBreeds.push(`mutt`);
    }
  }
}

//JQUERY WRAPPER

$(function() {
  //Getting all of the dog breeds

  getAllBreeds();

  //Submit Initial Request to fetch Dogs according to the search inputs

  $("form").on("submit", function(event) {
    breedName = $("#pet-search").val();
    postalCode = $("#postal").val();
    dogAge = $("#age").val();
    dogGender = $("#gender").val();
    event.preventDefault();
    $("#pet-search").val("");
    $("#postal").val("");
    trackOffset = "0";
    sendPetFinderRequest(breedName, postalCode, dogGender, dogAge);
    getNumberOfQualifiedDogs(breedName, postalCode, dogGender, dogAge);
    pageNum++;
  });

  // ANOTHER AJAX CALL TO GET TOTAL NUMBER OF DOGS

  function getNumberOfQualifiedDogs(breed, postalCode, gender, age) {
    $.ajax({
      url: `http://api.petfinder.com/pet.find?callback=?&key=831e7bdec6900fcd456fd38ddb8ba34d`,
      data: {
        key: `831e7bdec6900fcd456fd38ddb8ba34d`,
        animal: `dog`,
        breed: breed,
        location: postalCode,
        format: `json`,
        offset: trackOffset,
        age: dogAge,
        sex: dogGender,
        count: 1000
      },
      type: "GET",
      dataType: "json"
    }).done(function(data) {
      totalNumberOfQualifiedDogs = data.petfinder.pets.pet.length;
      renderNumberOfPages();
    });
  }

  // GETTING FIRST FIVE DOGS THAT WILL BE DISPLAYED ON A PAGE

  function sendPetFinderRequest(breed, postalCode, gender, age) {
    $.ajax({
      url: `http://api.petfinder.com/pet.find?callback=?&key=831e7bdec6900fcd456fd38ddb8ba34d`,
      data: {
        key: `831e7bdec6900fcd456fd38ddb8ba34d`,
        animal: `dog`,
        breed: breed,
        location: postalCode,
        format: `json`,
        offset: trackOffset,
        count: 5,
        age: dogAge,
        sex: dogGender
      },
      type: "GET",
      dataType: "json"
    })
      .done(function(data) {
        console.log(data);
        searchedDogsBreeds = [];
        yieldedAdresses = [];
        refinedAddresses = [];
        addressGeoCode = [];
        getAddresses(data);
        refineAddresses();
        renderPets(data);
        geoCodeAddress();
        retreiveBreed(data);
        renderNumberOfPages();
      })
      .fail(
        (renderDiv.innerHTML = `<h1>Did not receive server response.</h1>`)
      );
  }

  //EVENT HANDLERS

  previousButton.addEventListener("click", function(event) {
    event.stopPropagation();
    if (parseInt(trackOffset) >= 5) {
      trackOffset = String(parseInt(trackOffset) - 5);
    }
    sendPetFinderRequest(breedName, postalCode, dogGender, dogAge);
    $("html").scrollTop(0);
  });

  nextButton.addEventListener("click", function(event) {
    event.stopPropagation();
    trackOffset = String(parseInt(trackOffset) + 5);
    sendPetFinderRequest(breedName, postalCode, dogGender, dogAge);
    $("html").scrollTop(0);
  });

  $(".results").on("click", "button", function(event) {
    $.ajax({
      url: `https://en.wikipedia.org/w/api.php?exintro=&explaintext=&callback=?`,
      type: `GET`,
      dataType: `json`,
      headers: { "Api-User-Agent": "Example/1.0" },
      data: {
        format: `json`,
        action: `query`,
        prop: `extracts`,
        titles: `${$(this)
          .prev("ul.dog-result")
          .children("li:nth-child(2)")
          .attr("class")}`
      }
    }).done(function(response) {
      console.log(response);
      let breedTag = Object.keys(response.query.pages);
      breedInfo = response.query.pages[breedTag].extract;
      if (breedInfo == ``) {
        $(event.currentTarget)
          .next(`div`)
          .html(
            `<h2>Sorry, we could not find any additional information about this breed</h2>`
          );
      } else {
        $(event.currentTarget)
          .next(`div`)
          .text(breedInfo);
      }
      $(event.currentTarget).hide();
    });
  });

  // SPINNER FOR LOADING

  $(document).ajaxStart(function() {
    $(".lds-bars").show();
  });
  $(document).ajaxStop(function() {
    $(".lds-bars").hide();
  });
});
