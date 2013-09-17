package controllers;


import play.*;
import play.mvc.*;
import play.libs.Json;
import play.mvc.Http.RequestBody;
import java.util.Map;
import play.data.DynamicForm;
import models.*;
import layoutsbyme.*;

import org.codehaus.jackson.JsonFactory;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import java.io.IOException;
import java.util.ArrayList;

import views.html.*;

public class Application extends Controller {
  
    public static Result index() {
        return ok(index.render("Your new application is ready."));
    }

    public static Result returnJSON() {
	String [] sarr = new String[3];
	sarr[0] = "zero";
	sarr[1] = "one";
	sarr[2] = "two";
	return ok(Json.toJson(sarr));
    }

    public static Result receiveJSON(String parameter) {
	
	String res = "";
	res = parameter+"\njijiijij\n";
	/*
	RequestBody body = request().body();
	String textBody = body.asText();
	if(textBody != null) {
	    res = "Got: " + textBody;
	} else {
	    res = "ah?\n";
	}*/
	return ok(res);
    }

    public static Result post()  throws JsonParseException, JsonMappingException, IOException {

	    ArrayList<Node> nodes = new ArrayList<Node>();
	    ArrayList<Edge> edges = new ArrayList<Edge>();

	    //System.out.println("Nodes\n");
	    String nodesRAW = request().body().asFormUrlEncoded().get("nodes")[0];
	    //ObjectMapper mapper = new ObjectMapper();
	    //mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
	    try {
		nodesRAW = nodesRAW.replace("'","\"");
		//nodesRAW = nodesRAW.substring(1, nodesRAW.length()-1) ;
		JsonFactory f = new JsonFactory();
        	JsonParser jp = f.createJsonParser(nodesRAW);
        	ObjectMapper mapper = new ObjectMapper();
		jp.nextToken();
		
		while (jp.nextToken() == JsonToken.START_OBJECT) {
		  Node foobar = mapper.readValue(jp, Node.class);
		  nodes.add(foobar);
		  //System.out.println(foobar.getId()+" - "+foobar.getOcc()+" - "+foobar.getGroup());
		}
		
	    } catch (Exception e){
		System.out.println(e);
	    }
	    //System.out.println("\nLinks\n");
	    String linksRAW = request().body().asFormUrlEncoded().get("links")[0];

	    try {
		linksRAW = linksRAW.replace("'","\"");
		JsonFactory f = new JsonFactory();
        	JsonParser jp = f.createJsonParser(linksRAW);
        	ObjectMapper mapper = new ObjectMapper();
		jp.nextToken();
		
		while (jp.nextToken() == JsonToken.START_OBJECT) {
		  Edge foobar = mapper.readValue(jp, Edge.class);
		  edges.add(foobar);
		  //System.out.println(foobar.getSource()+" - "+foobar.getTarget()+" - "+foobar.getValue());
		}
		
	    } catch (Exception e){
		System.out.println(e);
	    }
	    String[] s = new String[2];
	    s[0] = "bonjour";
	    s[1] = "monde";
	    Main m = new Main();
	    try {
		ArrayList<ANode> nodesArrayList = m.main(s,nodes,edges);
		Node[] ns = new Node[nodesArrayList.size()];	
		int i = 0;
		for(ANode n : nodesArrayList){
			//System.out.println("( "+n.getId()+" , "+n.getDegree()+" , "+n.x()+" , "+n.y()+" )");
			ns[i] = new Node();
			ns[i].setId(n.getId());
			ns[i].setsID(nodes.get(n.getId()).getsID());
			ns[i].setX(n.x());
			ns[i].setY(n.y());
			ns[i].setOcc((int)n.getDegree());
			i++;
		}
		//System.out.println(Json.toJson(ns));
	    	System.out.println("C'est fini en fait\n\n");
		return ok(Json.toJson(ns));

	    } catch(Exception e){
		System.out.println(e);
	    }
	    return ok("error");
    }

  
}