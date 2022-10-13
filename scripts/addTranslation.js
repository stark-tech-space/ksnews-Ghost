// usage: node scripts/addTranslation.js
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");

const EN_FILES = ["en-us.json", "en.json"];
const ZH_FILES = ["zh.json"];

// 获取文件
function getFileContent(fileName) {
  const filePath = path.resolve(
    __dirname,
    `../ghost/admin/translations/${fileName}`
  );
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

// 写入文件
function setFileContent(fileName, content) {
  const filePath = path.resolve(
    __dirname,
    `../ghost/admin/translations/${fileName}`
  );
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf-8");
}

// 根据key数组，设置对象中的值
function setObjValue(obj, keys, value) {
  if (keys.length === 1) {
    if (value) {
      obj[keys[0]] = value;
    } else {
      return obj[keys[0]];
    }
  } else {
    if (!obj[keys[0]]) {
      obj[keys[0]] = {};
    }

    return setObjValue(obj[keys[0]], keys.slice(1), value);
  }
}

function addTranslation() {
  // 要求用户输入翻译信息
  inquirer
    .prompt([
      {
        type: "input",
        name: "location",
        message: "请输入文本位置（例如 Manual.Dashboard）",
        validate: function (val) {
          if (val) {
            return true;
          }
          return "文本位置不能为空";
        },
      },
      {
        type: "input",
        name: "raw",
        message: "请输入原始文本",
        validate: function (val) {
          if (val) {
            return true;
          }
          return "原始文本不能为空";
        },
      },
      {
        type: "input",
        name: "transkey",
        message: "请输入文本key（可选，不填使用原始文本代替）",
      },
      {
        type: "input",
        name: "transval",
        message: "请输入翻译文本（可选，不填使用原始文本代替）",
      },
    ])
    .then((answers) => {
      const { location, raw } = answers;
      let { transkey, transval } = answers;
      const loc = location.split(".");

      if (!transkey) {
        transkey = raw.split(" ").join("_");
      }

      loc.push(transkey);

      if (!transval) {
        transval = raw;
      }

      EN_FILES.forEach((file) => {
        const content = getFileContent(file);
        setObjValue(content, loc, raw);
        setFileContent(file, content);
      });

      ZH_FILES.forEach((file) => {
        const content = getFileContent(file);
        setObjValue(content, loc, transval);
        setFileContent(file, content);
      });

      const logs = [];
      logs.push(`已添加文本位置：${location}`);
      logs.push(`{{t "${loc.join(".")}"}}`);
      logs.push(`this.intl.t(\`${loc.join(".")}\`)`);

      console.log(logs.join("\n\n"));

      addTranslation();
    });
}

addTranslation();
