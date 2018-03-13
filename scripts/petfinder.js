// 831e7bdec6900fcd456fd38ddb8ba34d API key  -- Petfinder
// AIzaSyAR6_jdyKWQCb3VYusDt95oE39dDgDIpdA   -- Google Maps JS API


//DOM VALUES

let breedInput = document.getElementById('pet-search');
//VALUES


let yieldedAdresses = [];
let refinedAddresses = [];
//Breed Suggestions
let allBreedsArray = [];
new Awesomplete(breedInput, {
  list: allBreedsArray
})


//FUNCTIONS//

new Awesomplete(breedInput, {
  list: allBreedsArray
})

function getAddresses(data) {
  let address = data.petfinder.pets.pet
  address.map(pet => {
    yieldedAdresses.push({
      "address": pet.contact.address1,
      "city": pet.contact.city,
      "state": pet.contact.state,
      "zip": pet.contact.zip
    })
  })
  yieldedAdresses.map(result => {
    if (result.address.$t == 'undefined') {
      refinedAddresses.push({
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t
      })
    } else {
      refinedAddresses.push({
        address: result.address.$t,
        city: result.city.$t,
        state: result.state.$t,
        zip: result.zip.$t
      })
    }


  })
}

function getAllBreeds() {
  $.ajax({
    url: `http://api.petfinder.com/breed.list?key=831e7bdec6900fcd456fd38ddb8ba34d&animal=dog&format=json&callback=?`,
    type: `GET`,
    dataType: `json`,
    success: function (response) {
      response.petfinder.breeds.breed.map(dogs => allBreedsArray.push(dogs.$t));
      return allBreedsArray;
    }
  })
}

function geoCodeAddress() {
  geocoder.geocode({

  })
}

$(function () {

  //Getting all of the dog breeds

  getAllBreeds();

  //Submit Initial Request to fetch Dogs according to the search inputs

  $('form').on('submit', function (event) {
    let breedName = $('#pet-search').val();
    let postalCode = $('#postal').val();
    event.preventDefault();
    console.log(breedName, postalCode)
    $('#pet-search').val('');
    $('#postal').val('');
    sendPetFinderRequest(breedName, postalCode);
  })

  function sendPetFinderRequest(breed, postalCode) {
    $.ajax({
        url: `http://api.petfinder.com/pet.find?callback=?`,
        data: {
          key: `831e7bdec6900fcd456fd38ddb8ba34d`,
          animal: `dog`,
          breed: breed,
          location: postalCode,
          format: `json`
        },
        type: "GET",
        dataType: "json"
      })

      .done(function (data) {
        getAddresses(data);
      })
  }

})




//DISPLAYING A PET

// let firstPet = response.petfinder.pets.pet[0];
// if (firstPet.media.length >= 1) {
//   $('.results').html(`
//   <img src=${firstPet.media.photos.photo[2].$t}
//   <ul>
//   <li>Age: ${firstPet.age.$t}</li>
//   <li>Sex: ${firstPet.sex.$t}</li>
//   <li>Description ${firstPet.description.$t}</li>
//   </ul>`)
// } else {
//   $('.results').html(`
//   <ul>
//   <li>Age: ${firstPet.age.$t}</li>
//   <li>Sex: ${firstPet.sex.$t}</li>
//   <li>Description ${firstPet.description.$t}</li>
//   </ul>`)
// }