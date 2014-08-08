$(window).load ->
  $(document).ready ->
    $("form").submit (event) ->
      $form = $(this)
      checkPass = true
      $form.find("input").each (i, e) ->
        if e.value.length is 0
          event.preventDefault()
          $(".error-message").html "#{e.name} cannot be empty"
          checkPass = false

      if checkPass and $form.is "[name=\"register\"]"
        if $form.find("#password").val() isnt $form.find("#cpass").val()
          event.preventDefault()
          $(".error-message").html "<p>Passwords don't match</p>"
