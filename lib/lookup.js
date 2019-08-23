/**
 * Lookup remote information
 */


const CODE_UNDEFINED = 0;
const CODE_NL = 500;
const CODE_BE = 501;
const CODE_GB = 502;
const CODE_F  = 503;
const CODE_D  = 504;
const CODE_L  = 600;
const CODE_US = 686;

const countries = {
  unknown: CODE_UNDEFINED,
  nl : CODE_NL,
  be : CODE_BE,
  de : CODE_D,
  gb : CODE_GB,
  lu : CODE_L,
  fr : CODE_F,
  us : CODE_US
};

const countryNumberRight = {
    unknown: undefined,
    nl: true,
    be: true,
    de: true,
    gb: false,
    lu: true,
    fr: true,
    us: false
}


function country(name) {
  name = name.toLowerCase();
  switch (name) {
    case 'nederland':
    case 'nl':
    case 'holland':
      return Promise.resolve(countries.nl);
    case 'belgie' :
    case 'belgië' :
      return Promise.resolve(countries.be);
    case 'duitsland' :
    case 'germany' :
      return Promise.resolve(countries.de);
    case 'france' :
    case 'frankrijk' :
      return Promise.resolve(countries.f);
    case 'groot brittannië' :
    case 'groot brittannie' :
    case 'verenigd koninkrijk' :
    case 'engeland' :
      return Promise.resolve(countries.gb);
    default:
      return Promise.resolve(countries.unknown);
  }
};


function countryNumberRightId(id) {
  for (let key in countries) {
    if (!countries.hasOwnProperty(key)) { continue }
    if (countries[key] === id) {
      return countryNumberRight[key]
    }
  }
  return undefined;
}

/**
 *
 * @param zipcode
 * @param number
 * @param country
 * @returns Promise string or false
 */
function zipcodeToStreet(zipcode, number, country) {
  // TODO implement the server lookup
  return Promise.resolve('damrak')
}

function streetToZipcode(street, number, city) {
  // TODO implement the server lookup
  return Promise.resolve('1001 ML');
}

module.exports.country = country;
module.exports.Countries = countries;
module.exports.CountryNumberRight = countryNumberRight;
module.exports.countryNumberRightId = countryNumberRightId;
module.exports.zipcodeToStreet = zipcodeToStreet;
module.exports.streetToZipcode = streetToZipcode;