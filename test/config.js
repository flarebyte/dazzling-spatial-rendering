const native1A = {
  name: 'native1',
  conf: [ 'sizeUnit' ],
  rendering:
  {
    structures: [ {
      description: 'renderer1 description',
      type: 'colors',
      tags: [ 'native1:colors' ],
      constraints: [
        {
          min: 3,
          max: 9,
          multiple: 3
        }
      ]
    },
      {
        description: 'renderer2 description',
        type: 'xy',
        tags: [ 'native1:xy' ],
        constraints: [
          {
            flags: [ 'uniq' ]
          }
        ]
      },
      ]
  }
};

const plugin1 = {
  name: 'mydomain:plugin1',
  version: '1.0.0',
  description: 'description of plugin 1',
  homepage: 'https://github.com/flarebyte/dazzling-spatial-rendering#readme',
  repository: 'git+https://github.com/flarebyte/dazzling-spatial-rendering.git',
  author: {
    name: 'Olivier Huin',
    url: 'https://github.com/olih'
  },
  natives: [ native1A ]
};

const native2A = {
  name: 'native2A',
  conf: [ 'sizeUnit' ],
  rendering:
  {
    structures: [ {
      description: 'renderer1 description',
      type: 'colors',
      tags: [ 'native1:colors' ],
      constraints: [
        {
          min: 3,
          max: 9,
          multiple: 3
        }
      ]
    },
      {
        description: 'renderer2 description',
        type: 'xy',
        tags: [ 'native1:xy' ],
        constraints: [
          {
            flags: [ 'uniq' ]
          }
        ]
      },
      ]
  }
};

const native2B = {
  name: 'native2B',
  conf: [ 'sizeUnit' ],
  rendering:
  {
    structures: [ {
      description: 'renderer1 description',
      type: 'colors',
      tags: [ 'native1:colors' ],
      constraints: [
        {
          min: 3,
          max: 9,
          multiple: 3
        }
      ]
    },
      {
        description: 'renderer2 description',
        type: 'xy',
        tags: [ 'native1:xy' ],
        constraints: [
          {
            flags: [ 'uniq' ]
          }
        ]
      },
      ]
  }
};


const plugin2 = {
  name: 'mydomain:plugin2',
  version: '1.0.0',
  description: 'description of plugin 2',
  homepage: 'https://github.com/flarebyte/dazzling-spatial-rendering#readme',
  repository: 'git+https://github.com/flarebyte/dazzling-spatial-rendering.git',
  author: {
    name: 'Olivier Huin',
    url: 'https://github.com/olih'
  },
  natives: [ native2A, native2B ]
};


const valid = {
  plugins: [ plugin1, plugin2 ]
};

export default { valid, plugin1 };
