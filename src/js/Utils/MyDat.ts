import * as dat from 'dat.gui'

export default class MyDat {
  private static gui: dat.GUI

  public static getGUI(): dat.GUI {
    if (MyDat.gui == null) {
      MyDat.gui = new dat.GUI()
      const params = new URL(document.location as any).searchParams
      if (!params.has('debug')) MyDat.gui.hide()
    }
    return MyDat.gui
  }
}
