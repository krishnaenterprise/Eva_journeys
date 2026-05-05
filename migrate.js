const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace opening grid
html = html.replace('<div class="packages-grid">', '<div class="swiper packages-slider" id="packagesSlider">\n            <div class="swiper-wrapper packages-wrapper" id="packagesWrapper">');

// Wrap each package card in a swiper-slide
html = html.replace(/(<!-- Package \d+ -->\s*<div class="package-card")/g, '<div class="swiper-slide">\n                $1');

// Close the swiper slides
let parts = html.split('<!-- Package ');
let new_parts = [parts[0]];
for (let i = 1; i < parts.length; i++) {
    if (i > 1) {
        new_parts.push('    </div>\n                <!-- Package ' + parts[i]);
    } else {
        new_parts.push('<!-- Package ' + parts[i]);
    }
}
html = new_parts.join('');

// Add swiper pagination and close the swiper-wrapper and swiper
html = html.replace('                </div>\n            </div>\n            \n            <div class="text-center mt-50"', '                </div>\n                </div>\n            </div>\n            <div class="swiper-pagination packages-pagination" style="position: relative; margin-top: 30px;"></div>\n            </div>\n            \n            <div class="text-center mt-50"');

// Modify the button
html = html.replace('<a href="#" class="btn btn-primary btn-large">View All Packages <i class="fas fa-arrow-right"></i></a>', '<button id="viewAllPackagesBtn" class="btn btn-primary btn-large">View All Packages <i class="fas fa-arrow-right"></i></button>');

fs.writeFileSync('index.html', html);
console.log("Migration complete.");
