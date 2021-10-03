import * as dat from 'dat.gui'

export default class MyDat {
    private static gui: dat.GUI

    public static getGUI(): dat.GUI {
        if (MyDat.gui == null) MyDat.gui = new dat.GUI()
        return MyDat.gui
    }
}
