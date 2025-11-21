#Register
class RegistrationsController < ApplicationController
    def new
    end

    def create
        redirect_to "/login"
    end
end