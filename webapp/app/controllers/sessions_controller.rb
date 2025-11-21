#Login/Logout
class SessionsController < ApplicationController
    def new
    end

    def create

        redirect_to "/camera"
    end
end