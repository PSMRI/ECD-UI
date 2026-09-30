const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const quote = (file) => `"${file.replace(/\\/g, '/').replace(/"/g, '\\"')}"`;

module.exports = {
  'src/**/*.ts': (files) =>
    chunk(files, 25).map(
      (group) => `eslint --fix --no-warn-ignored ${group.map(quote).join(' ')}`,
    ),
};
