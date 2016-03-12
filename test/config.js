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

const valid = {
  plugins: [ plugin1 ]
};

export default { valid, plugin1 };
