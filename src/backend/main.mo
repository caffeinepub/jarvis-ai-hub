import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    principal : Principal;
    tokenBalance : Int;
    tier : Text;
    created : Time.Time;
    lastReset : Time.Time;
  };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      Principal.compare(a.principal, b.principal);
    };
  };

  public type Message = {
    role : Text;
    content : Text;
    timestamp : Time.Time;
  };

  public type ImageRequest = {
    prompt : Text;
    style : Text;
    timestamp : Time.Time;
  };

  public type GameScore = {
    user : Principal;
    gameName : Text;
    score : Int;
    timestamp : Time.Time;
  };

  module GameScore {
    public func compareByScore(a : GameScore, b : GameScore) : Order.Order {
      Int.compare(b.score, a.score);
    };
  };

  // Storage
  let profiles = Map.empty<Principal, UserProfile>();
  let messages = Map.empty<Principal, List.List<Message>>();
  let images = Map.empty<Principal, List.List<ImageRequest>>();
  let gameScores = Map.empty<Text, List.List<GameScore>>();

  // User Profile Management
  public shared ({ caller }) func registerUser() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };
    if (profiles.containsKey(caller)) { Runtime.trap("User already registered") };
    let profile : UserProfile = {
      principal = caller;
      tokenBalance = 1000;
      tier = "free";
      created = Time.now();
      lastReset = Time.now();
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func upgradeToPremium() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upgrade to premium");
    };
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };
    profiles.add(
      caller,
      {
        profile with
        tier = "premium";
        tokenBalance = 10000;
      },
    );
  };

  public shared ({ caller }) func consumeTokens(amount : Int, _actionName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can consume tokens");
    };
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };
    if (profile.tokenBalance < amount) { Runtime.trap("Insufficient tokens") };
    profiles.add(
      caller,
      {
        profile with
        tokenBalance = profile.tokenBalance - amount;
      },
    );
  };

  public shared ({ caller }) func resetMonthlyTokens() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset tokens");
    };
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?p) { p };
    };

    // 30 days in nanoseconds
    let thirtyDays = 30 * 24 * 60 * 60 * 1_000_000_000;
    if (Time.now() - profile.lastReset < thirtyDays) {
      Runtime.trap("Too early to reset tokens");
    };

    let newBalance = if (profile.tier == "premium") { 10000 } else { 1000 };

    profiles.add(
      caller,
      {
        profile with
        tokenBalance = newBalance;
        lastReset = Time.now();
      },
    );
  };

  // Chat Management
  public shared ({ caller }) func addMessage(role : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };
    let message : Message = {
      role;
      content;
      timestamp = Time.now();
    };
    let userMessages = switch (messages.get(caller)) {
      case (null) { List.empty<Message>() };
      case (?msgList) { msgList };
    };
    userMessages.add(message);
    messages.add(caller, userMessages);
  };

  public query ({ caller }) func getHistory() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat history");
    };
    switch (messages.get(caller)) {
      case (null) { [] };
      case (?msgList) { msgList.toArray() };
    };
  };

  // Image Log Management
  public shared ({ caller }) func addImageRequest(prompt : Text, style : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add image requests");
    };
    let request : ImageRequest = {
      prompt;
      style;
      timestamp = Time.now();
    };
    let userImages = switch (images.get(caller)) {
      case (null) { List.empty<ImageRequest>() };
      case (?imgList) { imgList };
    };
    userImages.add(request);
    images.add(caller, userImages);
  };

  public query ({ caller }) func getImageHistory() : async [ImageRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access image history");
    };
    switch (images.get(caller)) {
      case (null) { [] };
      case (?imgList) { imgList.toArray() };
    };
  };

  // Game Scores Management
  public shared ({ caller }) func saveScore(gameName : Text, score : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save scores");
    };
    let gameScore : GameScore = {
      user = caller;
      gameName;
      score;
      timestamp = Time.now();
    };

    let existingScores = switch (gameScores.get(gameName)) {
      case (null) { List.empty<GameScore>() };
      case (?scoreList) { scoreList };
    };

    existingScores.add(gameScore);
    gameScores.add(gameName, existingScores);
  };

  public query ({ caller }) func getTopScores(gameName : Text) : async [GameScore] {
    // Public leaderboard - no authorization required
    switch (gameScores.get(gameName)) {
      case (null) { [] };
      case (?scoreList) {
        let scoresArray = scoreList.toArray();
        let sorted = scoresArray.sort(GameScore.compareByScore);
        sorted.sliceToArray(0, Int.min(sorted.size(), 10));
      };
    };
  };
};
