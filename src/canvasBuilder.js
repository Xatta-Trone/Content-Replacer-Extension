const canvasBuilder = {
  buildCanvas: ({ id = '' }) => {
    const div = document.createElement('div');
    div.id = id;
    div.setAttribute(
      'style',
      'display:inline-block;color:white; margin-top:10px;text-align:center;position:sticky;bottom:20px;left:100%;transform:translateX(-10%);z-index:99999;max-width:10%;background: #2D8DFF;padding: 10px;border-radius:10px;'
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
      'color: white;border: white;border-top: 3px solid;border-radius: 52px;'
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
};

export default canvasBuilder;
