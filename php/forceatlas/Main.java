/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package forceatlas;

import java.io.FileNotFoundException;
import java.io.IOException;

/**
 *
 * @author pksm3
 */
public class Main {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException, IOException {
        System.out.println(Math.min(4, Math.max(1, Runtime.getRuntime().availableProcessors())));

        // TODO code application logic here
        //"http://localhost:8080/getJSON?callback=jQuery19109809626471251249_1377620962679&unique_id=Greg__Paperin&it=1&_=1377620962680");
        
        //ForceAtlas2 fa2 = new ForceAtlas2(null);
        //fa2.initAlgo();
        //fa2.goAlgo();
        
        ForceAtlasLayout fa = new ForceAtlasLayout();
        fa.initAlgo();
        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
//        fa.goAlgo();
        
        System.out.println("finish");
        fa.legraphe.showGraph();
        

    }
}
