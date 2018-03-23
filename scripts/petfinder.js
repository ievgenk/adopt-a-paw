// 831e7bdec6900fcd456fd38ddb8ba34d API key  -- Petfinder
// AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA   -- Google Maps JS API

//DOM VALUES

let renderDiv = document.querySelector(".results");
let breedInput = document.getElementById("pet-search");
let previousButton = document.getElementById("previous");
let nextButton = document.getElementById("next");
let pageNumberDiv = document.getElementById("pageNum");
//VALUES


let state = {
  breedInfo: ``,
  yieldedAdresses: [],
  refinedAddresses: [],
  addressGeoCode: [],
  trackOffset: 0,
  breedName: ``,
  postalCode: ``,
  totalNumberOfQualifiedDogs: ``,
  searchedDogsBreeds: [],
  dogNames: [],
  allBreedsArray: []
}


//FUNCTIONS//

//Breed Suggestions
new Awesomplete(breedInput, {
  list: state.allBreedsArray
});

function getAddresses(data) {
  let address = data.petfinder.pets.pet;
  address.map(pet => {
    state.yieldedAdresses.push({
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
  state.yieldedAdresses.map(result => {
    if (result.address.$t == null) {
      state.refinedAddresses.push({
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t,
        email: result.email.$t,
        phone: result.phone.$t
      });
    } else {
      state.refinedAddresses.push({
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
    url: `https://api.petfinder.com/breed.list?key=831e7bdec6900fcd456fd38ddb8ba34d&animal=dog&format=json&callback=?`,
    type: `GET`,
    dataType: `json`,
    success: function (response) {
      response.petfinder.breeds.breed.map(dogs => state.allBreedsArray.push(dogs.$t));
      return state.allBreedsArray;
    }
  });
}

function addressLoaded(geoCode) {
  try {
    state.addressGeoCode.push(geoCode.results[0].geometry.location);
    tryShowMap();
  } catch (error) {
    console.log(`Could not load and display one of the addresses`);
  }
}

function geoCodeAddress() {
  for (let i = 0; i < state.yieldedAdresses.length; i++) {
    if (state.refinedAddresses[i].address === undefined) {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${
          state.refinedAddresses[i].city
        } ${state.refinedAddresses[i].state} ${state.refinedAddresses[i].zip}`,
        type: "GET",
        dataType: "json"
      }).done(addressLoaded);
    } else {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA&address=${
          state.refinedAddresses[i].address
        } ${state.refinedAddresses[i].city} ${state.refinedAddresses[i].state} ${
          state.refinedAddresses[i].zip
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
      renderDivHtml += `<div class="one-dog-row">`;
      renderDivHtml += `<div class='dog-frame'>`;
      if (Object.keys(pets[i].media).length == 0) {
        renderDivHtml += `
        <img src="assets/img/g340.png" alt="Dog Photo" class='dog-no-photo'>`;
      } else {
        renderDivHtml += `
        <img src="${
          pets[i].media.photos.photo[2].$t
        }" alt="Dog Photo" class='dog-photo'>`;
      }
      if (Object.keys(pets[i].name).length == 0) {
        renderDivHtml += `<h3 class='dog-name'>Name is not availiable</h3>`;
      } else {
        state.dogNames.push(pets[i].name.$t);
        renderDivHtml += `
          <h3 class='dog-name'>${pets[i].name.$t}</h3>`;
      }
      renderDivHtml += `</div>`;
      renderDivHtml += `<div class="dog-result white-background rounded-corners">`;
      renderDivHtml += `<ul class="">`;
      // Start of the list
      if (Object.keys(pets[i].breeds.breed).length == 0) {
        renderDivHtml += `<li>Lovely Mutt</li>`;
      } else if (Array.isArray(pets[i].breeds.breed)) {
        renderDivHtml += `
        <li class="${pets[i].breeds.breed[0].$t}"><span class="breed">Primary Breed:</span> ${
          pets[i].breeds.breed[0].$t
        }</li>`;
      } else if (typeof pets[i].breeds.breed == `object`) {
        renderDivHtml += `
          <li class="${pets[i].breeds.breed.$t}"><span class="breed">Primary Breed:</span> ${
          pets[i].breeds.breed.$t
        }</li>`;
      }
      if (Object.keys(pets[i].sex).length == 0) {
        renderDivHtml += `<li>Gender not confirmed</li>`;
      } else {
        renderDivHtml += `
          <li><span class="gender">Gender:</span> ${pets[i].sex.$t}</li>`;
      }
      if (Object.keys(pets[i].age).length == 0) {
        renderDivHtml += `<li><span class="age">Pets age is not availiable</span></li>`;
      } else {
        renderDivHtml += `<li><span class="age">Age:</span> ${pets[i].age.$t}</li>`;
      }
      renderDivHtml += `<li><hr></li>`;
      renderDivHtml += `<li class="about">About</li>`
      if (Object.keys(pets[i].description).length == 0) {
        renderDivHtml += `<li>Description is not availiable</li>`;
      } else {
        renderDivHtml += `
          <li>${pets[i].description.$t}</li>`;
      }
      renderDivHtml += `<hr>`
      if (state.refinedAddresses[i].address == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<li><span class="address">Address:</span> ${state.refinedAddresses[i].address} `;
      }
      if (state.refinedAddresses[i].city == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<span class="address">City:</span> ${state.refinedAddresses[i].city} `;
      }
      if (state.refinedAddresses[i].state == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<span class="address">State:</span> ${state.refinedAddresses[i].state} `;
      }
      renderDivHtml += `<br>`;
      if (state.refinedAddresses[i].zip == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<span class="address">Postal Code:</span> ${state.refinedAddresses[i].zip} `;
      }
      if (state.refinedAddresses[i].email == null) {
        renderDivHtml += ` `;
      } else {
        `<span class="address">Email:</span> ${state.refinedAddresses[i].email} `;
      }
      if (state.refinedAddresses[i].phone == null) {
        renderDivHtml += ` `;
      } else {
        renderDivHtml += `<span class="address">Phone:</span> ${state.refinedAddresses[i].phone} `;
      }
      renderDivHtml += `</li>`;
      renderDivHtml += `</ul>`;
      renderDivHtml += `<button class="wiki-button">Learn More About Breed</button>`;
      renderDivHtml += `<div class="wiki-result"></div>`;
      renderDivHtml += `</div>`;
      renderDivHtml += `</div>`;
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
  if (state.addressGeoCode.length === 0) {
    //console.log(`addresses is not ready aborting`);
    return;
  }
  // console.log(`we are ready lets hsow it`);
  showMap();
}

function showMap() {
  let location;
  let contentString;
  let options = {
    zoom: 9,
    center: state.addressGeoCode[0]
  };
  let map = new google.maps.Map(document.getElementById("map"), options);



  function addMarkerWithInfo(coords, boxString) {
    let marker = new google.maps.Marker({
      position: coords,
      map: map
    });
    let infowindow = new google.maps.InfoWindow({
      content: boxString
    });
    marker.addListener('click', function () {
      infowindow.open(map, marker);
    });
  }
  for (let i = 0; i < 5; i++) {
    contentString = `<h3>${state.dogNames[i]}</h3>`;
    location = state.addressGeoCode[i];
    addMarkerWithInfo(location, contentString);
  }

}

function renderNumberOfPages() {
  pageNumberDiv.innerHTML = `<h3> Page ${state.trackOffset / 5 +
    1}/${Math.floor(state.totalNumberOfQualifiedDogs / 5)}</h3>`;
}

function retreiveBreed(data) {
  for (let i = 0; i < state.yieldedAdresses.length; i++) {
    if (data.petfinder.pets.pet[i].breeds.breed.length > 0) {
      state.searchedDogsBreeds.push(data.petfinder.pets.pet[i].breeds.breed[0].$t);
    } else {
      state.searchedDogsBreeds.push(`mutt`);
    }
  }
}

function revealContent() {
  $(".hidden").removeClass("hidden");
}

function preventNextClick() {
  if (
    state.trackOffset / 5 + 1 ==
    Math.floor(state.totalNumberOfQualifiedDogs / 5)
  ) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = false;
  }
}

function preventPrevClick() {
  if (state.trackOffset / 5 + 1 == 1) {
    previousButton.disabled = true;
  } else {
    previousButton.disabled = false;
  }
}

String.prototype.capitalize = function () {
  return this.replace(/(?:^|\s)\S/g, function (a) {
    return a.toUpperCase();
  });
};


//JQUERY WRAPPER

$(function () {
  //Event listener for questions button

  $('#cancel-button').on('click', function (event) {
    event.stopPropagation()
    $('.questions').toggleClass(`very-hidden`);
  })


  $('#question').on('click', function (event) {
    event.stopPropagation()
    $('.questions').toggleClass(`very-hidden`);
  })

  //Getting all of the dog breeds

  getAllBreeds();

  //Submit Initial Request to fetch Dogs according to the search inputs

  $("form").on("submit", function (event) {
    event.preventDefault();
    state.breedName = $("#pet-search").val();
    state.breedName = state.breedName.capitalize();
    state.postalCode = $("#postal").val();
    state.postalCode = state.postalCode.toUpperCase();
    dogAge = $("#age").val();
    dogGender = $("#gender").val();
    $("#pet-search").val("");
    state.trackOffset = 0;
    //$('main').addClass('white-background rounded-corners');
    sendPetFinderRequest(state.breedName, state.postalCode, dogGender, dogAge);
    getNumberOfQualifiedDogs(state.breedName, state.postalCode, dogGender, dogAge);
    pageNum++;
    revealContent();
  });

  // ANOTHER AJAX CALL TO GET TOTAL NUMBER OF DOGS

  function getNumberOfQualifiedDogs(breed, postalCode, gender, age) {
    $.ajax({
      url: `https://api.petfinder.com/pet.find?callback=?&key=831e7bdec6900fcd456fd38ddb8ba34d`,
      data: {
        key: `831e7bdec6900fcd456fd38ddb8ba34d`,
        animal: `dog`,
        breed: breed,
        location: postalCode,
        format: `json`,
        offset: state.trackOffset,
        age: dogAge,
        sex: dogGender,
        count: 500
      },
      type: "GET",
      dataType: "json"
    }).done(function (data) {
      state.totalNumberOfQualifiedDogs = data.petfinder.pets.pet.length;
      renderNumberOfPages();
    });
  }

  // GETTING FIRST FIVE DOGS THAT WILL BE DISPLAYED ON A PAGE

  function sendPetFinderRequest(breed, postalCode, gender, age) {
    $.ajax({
        url: `https://api.petfinder.com/pet.find?callback=?&key=831e7bdec6900fcd456fd38ddb8ba34d`,
        data: {
          key: `831e7bdec6900fcd456fd38ddb8ba34d`,
          animal: `dog`,
          breed: breed,
          location: postalCode,
          format: `json`,
          offset: `${state.trackOffset.toString()}`,
          count: 5,
          age: dogAge,
          sex: dogGender
        },
        type: "GET",
        dataType: "json"
      })
      .done(function (data) {
        console.log(data);
        if (data.petfinder.header.status.code.$t == "100" && Object.keys(data.petfinder.pets).length != 0) {
          state.dogNames = [];
          state.searchedDogsBreeds = [];
          state.yieldedAdresses = [];
          state.refinedAddresses = [];
          state.addressGeoCode = [];
          getAddresses(data);
          refineAddresses();
          renderPets(data);
          geoCodeAddress();
          retreiveBreed(data);
          renderNumberOfPages();
          $('#map').show();
          $('#nav-buttons').show();
          $(".loader").hide();
          preventPrevClick();
          preventNextClick();
          $('html, body').animate({
            scrollTop: $('#results').offset().top
          }, 500);

        } else {
          state.dogNames = [];
          state.searchedDogsBreeds = [];
          state.yieldedAdresses = [];
          state.refinedAddresses = [];
          state.addressGeoCode = [];
          $('#map').hide();
          $('#nav-buttons').hide();
          $(".loader").hide();
          renderDiv.innerHTML = `<h1 class='server-response'>No Results Found</h1>`
        }
      })

      .fail(function (xhr, textStatus, errorThrown) {
        console.log(textStatus, errorThrown)
      })
  }

  //EVENT HANDLERS

  previousButton.addEventListener("click", function (event) {
    event.stopPropagation();
    if (state.trackOffset >= 5) {
      state.trackOffset = state.trackOffset - 5;
    }
    sendPetFinderRequest(state.breedName, state.postalCode, dogGender, dogAge);
    $("html").scrollTop(0);
  });

  nextButton.addEventListener("click", function (event) {
    event.stopPropagation();
    state.trackOffset = state.trackOffset + 5;
    sendPetFinderRequest(state.breedName, state.postalCode, dogGender, dogAge);
    $("html").scrollTop(0);
  });

  // WIKIPEDIA API REQUEST TO LEARN MORE ABOUT THE BREED

  $(".results").on("click", "button", function (event) {
    $.ajax({
      url: `https://en.wikipedia.org/w/api.php?exintro=&explaintext=&callback=?`,
      type: `GET`,
      dataType: `json`,
      headers: {
        "Api-User-Agent": "Example/1.0"
      },
      data: {
        format: `json`,
        action: `query`,
        prop: `extracts`,
        titles: `${$(this)
          .prev("ul")
          .children("li:nth-of-type(1)")
          .attr("class")}`
      }
    }).done(function (response) {
      console.log(response);
      let breedTag = Object.keys(response.query.pages);
      state.breedInfo = response.query.pages[breedTag].extract;
      if (state.breedInfo == `` || response.query.pages[breedTag].missing == "") {
        $(event.currentTarget)
          .next(`div`)
          .html(
            `<h2>Sorry, we could not find any additional information about this breed</h2>`
          );
      } else {
        $(event.currentTarget)
          .next(`div`)
          .html(`<hr><p class="breed">Additional Breed Info<p><p class="white-background rounded-corners">${state.breedInfo}</p>`);
      }
      $(event.currentTarget).hide();
      $(".loader").hide();
    });
    console.log(
      $(this)
      .prev("ul")
      .children("li:nth-of-type(1)")
      .attr("class")
    );
  });

  // SPINNER FOR LOADING

  $(document).ajaxStart(function () {
    $(".loader").show();
  });
});