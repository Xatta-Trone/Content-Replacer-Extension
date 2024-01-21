const canvasBuilder = {
  buildCanvas: ({ id = '' }) => {
    const div = document.createElement('div');
    div.id = id;
    div.setAttribute(
      'style',
      'display:none;color:white; margin-top:10px;text-align:center;position:fixed;bottom:90px;right:0px;transform:translateX(-10%);z-index:99999;max-width:10%;background: #2D8DFF;padding: 10px;border-radius:10px;'
    );
    return div;
  },

  buildButton: ({ id = '', btnText = 'Button', icon = '', onclick }) => {
    const button = document.createElement('button');
    button.id = id;
    button.innerHTML = `${icon} ${btnText}`;
    button.setAttribute(
      'style',
      'padding:5px 15px; color:white; background: #10417A; border: none; margin-bottom: 10px;cursor: pointer;font-size: 16px;box-shadow: 0px 2px 3px 1px #2d8dff; border-radius: 10px;display:block;width:100%;'
    );

    button.onclick = () => onclick();
    return button;
  },

  buildHr: () => {
    const hr = document.createElement('hr');
    hr.setAttribute(
      'style',
      'color: white;border: white;border-top: 3px solid;border-radius: 52px;margin:10px auto;'
    );
    return hr;
  },

  popupBuilder: ({ id = '', className = '', html = '' }) => {
    const div = document.createElement('div');
    div.id = id;
    div.className = className;
    div.innerHTML = html;

    return div;
  },

  crossBuilder: () => {
    const btnCross = document.createElement('button');
    btnCross.innerHTML = '&times;';
    btnCross.setAttribute(
      'style',
      'font-size: 16px;position: absolute;top: 0;right: 0;border: none;cursor: pointer; text-align: center;padding: 3px 8px; margin:0;color:white;background: #10417a; border-radius:0 6px 0 6px;'
    );
    return btnCross;
  },
};

export default canvasBuilder;
