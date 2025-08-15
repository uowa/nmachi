### Dignified Styles For The Elderly.

Legacy generates a stylesheet for older browsers by extracting
media queries that match a specified "desktop" size.

#### No strings attached

Instead of relying on a specific [framework](http://compass-style.org)
or [build system](http://gruntjs.com) Legacy will work with anything that outputs
or processes a CSS file.

### Installation

    $ npm install legacy

### Usage

    $ legacy [options] [file] [min-width]

### Options
    -h, --help               output usage information
    -V, --version            output the version number

### Examples

#### Generating a legacy style sheet from an existing CSS file:

    $ legacy main.css 75em > main.legacy.css

The resulting style sheet includes all media queries that match `min-width <= 75em`

### API

    var legacy = require('legacy')

    legacy(string, minWidth)

## License

(The MIT License)

Copyright (c) 2012 Simen Brekken &lt;simen@unfold.no&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
